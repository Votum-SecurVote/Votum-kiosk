import time
from enum import Enum
from collections import Counter, deque
import cv2
import numpy as np

from modules.person_detection import count_persons_and_get_boxes
from modules.face_detection import detect_faces, get_face_bbox
from modules.liveness_detection import check_liveness_single_frame
from modules.face_verification import verify_face, load_voter_embedding
from config import (
    PERSON_HISTORY_LEN, FACE_HISTORY_LEN, LIVENESS_FRAMES,
    LIVENESS_THRESHOLD, COOLDOWN_MS
)
from logger import logger

class VerificationState(Enum):
    DETECT_PERSON = 1
    VALIDATE_SINGLE_PERSON = 2
    DETECT_FACE = 3
    VALIDATE_FACE_STABILITY = 4
    RUN_LIVENESS_DETECTION = 5
    FACE_VERIFICATION = 6
    VOTING_ALLOWED = 7

class VerificationPipeline:
    def __init__(self, voter_id="voter1"):
        self.state = VerificationState.DETECT_PERSON
        self.voter_id = voter_id
        
        self.person_history = deque(maxlen=PERSON_HISTORY_LEN)
        self.face_history = deque(maxlen=FACE_HISTORY_LEN)
        self.liveness_results = deque(maxlen=LIVENESS_FRAMES)
        
        self.cooldown_until = 0
        
        # Display info
        self.current_person_count = 0
        self.current_face_count = 0
        self.current_confidences = []
        self.liveness_status = "Unknown"
        self.ux_message = "Please stand still"
        self.verification_score = 0.0
        
        # Bounding boxes for drawing
        self.person_boxes = []
        self.face_boxes = []
        
        # The target face embedding cached once verified
        self.target_embedding = load_voter_embedding(self.voter_id)

    def reset_to_initial(self):
        self.state = VerificationState.DETECT_PERSON
        self.person_history.clear()
        self.face_history.clear()
        self.liveness_results.clear()
        self.liveness_status = "Unknown"
        self.ux_message = "Please stand still"
        self.person_boxes = []
        self.face_boxes = []

    def set_cooldown(self):
        self.cooldown_until = time.time() * 1000 + COOLDOWN_MS

    def is_in_cooldown(self):
        return (time.time() * 1000) < self.cooldown_until

    def process(self, frame):
        """ Runs the state machine logic for a single tick """
        if self.is_in_cooldown():
            return

        if self.state == VerificationState.DETECT_PERSON:
            self._handle_detect_person(frame)
        elif self.state == VerificationState.VALIDATE_SINGLE_PERSON:
            self._handle_validate_single_person()
        elif self.state == VerificationState.DETECT_FACE:
            self._handle_detect_face(frame)
        elif self.state == VerificationState.VALIDATE_FACE_STABILITY:
            self._handle_validate_face_stability()
        elif self.state == VerificationState.RUN_LIVENESS_DETECTION:
            self._handle_liveness(frame)
        elif self.state == VerificationState.FACE_VERIFICATION:
            self._handle_face_verification(frame)
        elif self.state == VerificationState.VOTING_ALLOWED:
            self.ux_message = "Verification successful. Voting Allowed."

    def _get_majority(self, history_deque):
        if not history_deque: return None
        counter = Counter(history_deque)
        return counter.most_common(1)[0][0]

    def _handle_detect_person(self, frame):
        count, boxes = count_persons_and_get_boxes(frame)
        self.current_person_count = count
        self.person_boxes = boxes
        self.person_history.append(count)
        self.ux_message = "Ensure only one person is in frame"
        
        # We need the full history to make a decision
        if len(self.person_history) == PERSON_HISTORY_LEN:
            self.state = VerificationState.VALIDATE_SINGLE_PERSON

    def _handle_validate_single_person(self):
        majority_count = self._get_majority(self.person_history)
        if majority_count == 1:
            logger.info("Single person validated.")
            self.state = VerificationState.DETECT_FACE
            self.ux_message = "Single person detected. Looking for face..."
            self.set_cooldown()
        else:
            self.state = VerificationState.DETECT_PERSON
            self.person_history.clear()
            if majority_count == 0:
                self.ux_message = "No person detected."
            else:
                self.ux_message = f"{majority_count} persons detected. Only 1 allowed."

    def _handle_detect_face(self, frame):
        faces = detect_faces(frame)
        self.current_face_count = len(faces)
        self.face_boxes = [get_face_bbox(f) for f in faces]
        self.face_history.append(len(faces))
        self.ux_message = "Face detected" if len(faces) == 1 else "Please face the camera clearly"
        
        if len(self.face_history) == FACE_HISTORY_LEN:
            self.state = VerificationState.VALIDATE_FACE_STABILITY

    def _handle_validate_face_stability(self):
        majority_count = self._get_majority(self.face_history)
        if majority_count == 1:
            logger.info("Single face validated.")
            self.state = VerificationState.RUN_LIVENESS_DETECTION
            self.ux_message = "Checking liveness..."
            self.set_cooldown()
        else:
            logger.warning(f"Face instability detected. Majority: {majority_count}")
            self.state = VerificationState.DETECT_FACE
            self.face_history.clear()
            self.ux_message = "Please keep your face clearly in frame"

    def _handle_liveness(self, frame):
        faces = detect_faces(frame)
        is_live = False
        
        if len(faces) == 1:
            face = faces[0]
            x1, y1, x2, y2 = get_face_bbox(face)
            h, w = frame.shape[:2]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            face_crop = frame[y1:y2, x1:x2]
            
            if face_crop.size > 0:
                is_live = check_liveness_single_frame(face_crop)
                
        self.liveness_results.append(is_live)
        self.ux_message = f"Checking liveness... ({len(self.liveness_results)}/{LIVENESS_FRAMES})"
            
        if len(self.liveness_results) == LIVENESS_FRAMES:
            real_count = sum(self.liveness_results)
            ratio = real_count / LIVENESS_FRAMES
            if ratio >= LIVENESS_THRESHOLD:
                logger.info("Liveness confirmed.")
                self.liveness_status = "REAL"
                self.state = VerificationState.FACE_VERIFICATION
                self.ux_message = "Verifying identity..."
                self.set_cooldown()
            else:
                logger.warning(f"Spoof detected! Score: {ratio}")
                self.liveness_status = "SPOOF"
                self.state = VerificationState.DETECT_PERSON
                self.ux_message = "Spoof detected. Restarting."
                self.person_history.clear()
                self.face_history.clear()
                self.liveness_results.clear()
                self.set_cooldown()

    def _handle_face_verification(self, frame):
        faces = detect_faces(frame)
        if len(faces) != 1:
            self.ux_message = "Lost face during verification."
            self.state = VerificationState.DETECT_FACE
            self.face_history.clear()
            return
            
        face = faces[0]
        live_embedding = face.embedding
        
        if self.target_embedding is None:
            self.target_embedding = load_voter_embedding(self.voter_id)
            if self.target_embedding is None:
                self.ux_message = "Error: Voter record not found."
                self.state = VerificationState.DETECT_PERSON
                self.set_cooldown()
                return

        is_match, score = verify_face(live_embedding, self.target_embedding)
        self.verification_score = score
        
        if is_match:
            logger.info(f"Verification successful: {score:.2f}")
            self.state = VerificationState.VOTING_ALLOWED
            self.ux_message = "Verification successful"
            self.set_cooldown()
        else:
            logger.warning(f"Verification failed: {score:.2f}")
            self.state = VerificationState.DETECT_PERSON
            self.ux_message = "Identity mismatch. Restarting."
            self.person_history.clear()
            self.face_history.clear()
            self.liveness_results.clear()
            self.set_cooldown()

    def draw_debug_info(self, frame):
        overlay = frame.copy()
        
        # Colors
        color_text = (0, 255, 255) # Yellow
        color_box_person = (255, 0, 0) # Blue
        color_box_face = (0, 255, 0) # Green
        
        # Draw Person Boxes
        for pb in self.person_boxes:
            x1, y1, x2, y2, conf = pb
            cv2.rectangle(overlay, (int(x1), int(y1)), (int(x2), int(y2)), color_box_person, 2)
            cv2.putText(overlay, f"Person {conf:.2f}", (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_box_person, 2)
            
        # Draw Face Boxes
        for fb in self.face_boxes:
            x1, y1, x2, y2 = fb
            cv2.rectangle(overlay, (int(x1), int(y1)), (int(x2), int(y2)), color_box_face, 2)
            cv2.putText(overlay, "Face", (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_box_face, 2)
            
        # Draw Info Text
        texts = [
            f"State: {self.state.name}",
            f"Persons: {self.current_person_count} (History: {list(self.person_history)})",
            f"Faces: {self.current_face_count} (History: {list(self.face_history)})",
            f"Liveness: {self.liveness_status}",
            f"Match Score: {self.verification_score:.2f}",
        ]
        
        y_offset = 30
        for t in texts:
            # Draw black background outline for text visibility
            cv2.putText(overlay, t, (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 4)
            cv2.putText(overlay, t, (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color_text, 2)
            y_offset += 30
            
        return overlay
