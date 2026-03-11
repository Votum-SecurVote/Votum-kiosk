import os
import sys
import cv2
import asyncio
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import numpy as np

# Ensure root dir is in path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from modules.camera import Camera
from modules.person_detection import count_persons_and_get_boxes
from modules.face_detection import detect_faces, get_face_bbox
from modules.liveness_detection import check_liveness_single_frame, preprocess_for_liveness
from modules.face_verification import verify_face
from logger import logger

app = FastAPI(title="Voting Kiosk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

camera = Camera()

# Dynamic global reference embedding
aadhaar_embedding = None

class LogMessage(BaseModel):
    level: str
    message: str
    timestamp: str

# In-memory store for connected clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_log(self, level: str, message: str):
        from datetime import datetime
        log_data = {
            "type": "log",
            "level": level,
            "message": message,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(log_data))
            except Exception:
                pass

    async def broadcast_status(self, status: str, color: str):
        status_data = {
            "type": "status",
            "message": status,
            "color": color
        }
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(status_data))
            except Exception:
                pass

    async def broadcast_steps(self, steps: list):
        steps_data = {
            "type": "steps",
            "data": steps
        }
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(steps_data))
            except Exception:
                pass


manager = ConnectionManager()

def log_and_broadcast(level: str, message: str):
    if level == "INFO" or level == "SUCCESS":
        logger.info(message)
    elif level == "WARNING":
        logger.warning(message)
    elif level == "DEBUG":
        logger.debug(message)
    else:
        logger.error(message)
    
    # Broadcast asynchronously
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast_log(level, message))
    except RuntimeError:
        pass # Handle cases where there is no running event loop

async def run_verification_pipeline():
    global aadhaar_embedding
    log_and_broadcast("INFO", "Starting verification pipeline...")
    
    steps = [
        {"stage": "person_detection", "status": "pending"},
        {"stage": "face_detection", "status": "pending"},
        {"stage": "liveness_check", "status": "pending"},
        {"stage": "aadhaar_match", "status": "pending"},
        {"stage": "final_verdict", "status": "pending"}
    ]
    await manager.broadcast_steps(steps)

    if aadhaar_embedding is None:
        log_and_broadcast("ERROR", "No Aadhaar image uploaded.")
        await manager.broadcast_status("Database Error", "orange")
        for step in steps:
            if step["status"] == "pending":
                step["status"] = "skipped"
        steps[-1]["status"] = "failed"
        await manager.broadcast_steps(steps)
        return {"steps": steps}

    try:
        # Step 1: Capture initial frame for person/face detection
        ret, frame = camera.read_frame()
        if not ret or frame is None:
            raise ValueError("Camera frame not available")

        # 1. Person Detection
        log_and_broadcast("INFO", "Detecting persons")
        persons, _ = count_persons_and_get_boxes(frame)
        log_and_broadcast("DEBUG", f"Persons detected: {persons}")
        
        if persons != 1:
            steps[0]["status"] = "failed"
            steps[-1]["status"] = "failed"
            await manager.broadcast_steps(steps)
            log_and_broadcast("ERROR", f"Failed: Detected {persons} persons. Exactly 1 required.")
            await manager.broadcast_status("Multiple Persons Detected" if persons > 1 else "No Person Detected", "red")
            return {"steps": steps}
        
        steps[0]["status"] = "success"
        await manager.broadcast_steps(steps)

        # 2. Face Detection
        log_and_broadcast("INFO", "Extracting face")
        faces = detect_faces(frame)
        
        if len(faces) != 1:
            steps[1]["status"] = "failed"
            steps[-1]["status"] = "failed"
            await manager.broadcast_steps(steps)
            log_and_broadcast("ERROR", f"Failed: Detected {len(faces)} faces.")
            await manager.broadcast_status("Face Not Detected" if len(faces) == 0 else "Multiple Faces", "red")
            return {"steps": steps}

        face = faces[0]
        # In InsightFace, face.det_score is usually available
        if hasattr(face, 'det_score'):
            log_and_broadcast("DEBUG", f"Face confidence: {face.det_score:.2f}")

        steps[1]["status"] = "success"
        await manager.broadcast_steps(steps)

        # Save the embedding for later comparison
        live_embedding = face.embedding

        # 3. Liveness Check (Temporal Smoothing across 10 frames)
        log_and_broadcast("INFO", "Running liveness detection")
        liveness_scores = []
        
        for i in range(10):
            ret, tmp_frame = camera.read_frame()
            if not ret or tmp_frame is None:
                continue
                
            # Do not use preprocess_for_liveness as it blurs the image, destroying textures needed for spoof detection
            tmp_faces = detect_faces(tmp_frame)
            
            if len(tmp_faces) == 1:
                tmp_face = tmp_faces[0]
                x1, y1, x2, y2 = get_face_bbox(tmp_face)
                
                # Silent-Face-Anti-Spoofing needs bbox = [x, y, w, h]
                bbox = [x1, y1, x2 - x1, y2 - y1]
                
                score = check_liveness_single_frame(tmp_frame, bbox)
                liveness_scores.append(score)
                log_and_broadcast("DEBUG", f"Frame {i+1} score: {score:.2f}")
            else:
                log_and_broadcast("DEBUG", f"Frame {i+1} skipped (no clear single face).")

            await asyncio.sleep(0.05) # Small buffer between frames

        if len(liveness_scores) == 0:
            avg_score = 0.0
        else:
            avg_score = float(sum(liveness_scores) / len(liveness_scores))
            
        log_and_broadcast("DEBUG", f"Average liveness score: {avg_score:.2f}")

        liveness_failed = False
        if avg_score < 0.5:
            steps[2]["status"] = "failed"
            liveness_failed = True
        else:
            steps[2]["status"] = "success"
            
        steps[2]["score"] = float(round(avg_score, 2))
        await manager.broadcast_steps(steps)
            
        # 4. Face Verification (Aadhaar Match)
        # We run this even if liveness fails so the user can see the match score
        log_and_broadcast("INFO", "Running face match")
            
        is_match, similarity = verify_face(live_embedding, aadhaar_embedding)
        similarity = float(similarity)
        log_and_broadcast("DEBUG", f"Face similarity: {similarity:.2f}")

        # Override default InsightFace thresholds to match User request similarity > 0.6 decision rule
        if similarity > 0.6:
            steps[3]["status"] = "success"
            steps[3]["similarity"] = float(round(similarity, 2))
        else:
            steps[3]["status"] = "failed"
            steps[3]["similarity"] = float(round(similarity, 2))
            
        if liveness_failed:
            steps[4]["status"] = "failed"
            await manager.broadcast_steps(steps)
            
            if similarity > 0.6:
                log_and_broadcast("ERROR", "Failed: Face Matched but Spoof Attack Detected!")
            else:
                log_and_broadcast("ERROR", "Failed: Spoof Attack & Face Mismatch!")
                
            await manager.broadcast_status("Spoof Attack Detected", "red")
            return {"steps": steps}
            
        if similarity > 0.6:
            steps[4]["status"] = "verified"
            await manager.broadcast_steps(steps)
            log_and_broadcast("SUCCESS", "Verification successful")
            await manager.broadcast_status("Voter Verified", "green")
        else:
            steps[4]["status"] = "failed"
            await manager.broadcast_steps(steps)
            log_and_broadcast("ERROR", f"Verification failed. Match score: {similarity*100:.1f}%")
            await manager.broadcast_status("Verification Failed", "red")

        return {"steps": steps}
        
    except Exception as e:
        logger.error(f"Pipeline error: {str(e)}")
        log_and_broadcast("ERROR", f"System Failure: {str(e)}")
        await manager.broadcast_status("SYSTEM ERROR", "orange")
        for step in steps:
            if step["status"] == "pending":
                step["status"] = "skipped"
        steps[-1]["status"] = "failed"
        await manager.broadcast_steps(steps)
        return {"steps": steps}


# Background task for camera
async def camera_worker():
    while True:
        try:
            ret, frame = camera.read_frame()
            if ret and len(manager.active_connections) > 0:
                # Compress into JPEG
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                frame_b64 = base64.b64encode(buffer).decode('utf-8')
                
                # Broadcast explicitly to active connections
                to_remove = []
                for connection in manager.active_connections:
                    try:
                        await connection.send_text(json.dumps({
                            "type": "frame",
                            "data": f"data:image/jpeg;base64,{frame_b64}"
                        }))
                    except Exception:
                        to_remove.append(connection)
                
                for dead_conn in to_remove:
                    manager.disconnect(dead_conn)
                    
        except Exception as e:
            logger.error(f"Camera worker error: {e}")
            
        await asyncio.sleep(0.05)  # ~20fps

@app.on_event("startup")
async def startup_event():
    logger.info("Starting API Server. Pre-loading models...")
    camera.start()
    log_and_broadcast("INFO", "Camera subsystem and biometrics engine initialized.")
    # Start the background worker
    asyncio.create_task(camera_worker())

@app.on_event("shutdown")
async def shutdown_event():
    camera.release()
    logger.info("API Server shutdown.")

@app.get("/")
def read_root():
    return {"status": "Voting Kiosk API is running"}

@app.post("/upload-aadhaar")
async def upload_aadhaar(file: UploadFile = File(...)):
    global aadhaar_embedding
    
    log_and_broadcast("INFO", "Uploading Aadhaar image...")

    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            log_and_broadcast("ERROR", "Invalid image format.")
            return {"status": "error", "message": "Failed to decode image."}

        faces = detect_faces(image)

        if len(faces) == 0:
            log_and_broadcast("ERROR", "No face detected in Aadhaar image.")
            return {"status": "error", "message": "No face detected in image."}
        
        if len(faces) > 1:
            log_and_broadcast("ERROR", f"Multiple faces ({len(faces)}) detected in Aadhaar image.")
            return {"status": "error", "message": "Multiple faces detected."}

        aadhaar_embedding = faces[0].embedding
        log_and_broadcast("SUCCESS", "Aadhaar image uploaded successfully.")

        # Create thumbnail for UI
        h, w = image.shape[:2]
        new_w = 250
        new_h = int(new_w * (h/w))
        thumb = cv2.resize(image, (new_w, new_h))
        
        _, buffer = cv2.imencode('.jpg', thumb)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "status": "success",
            "message": "Aadhaar image uploaded",
            "preview": f"data:image/jpeg;base64,{img_base64}"
        }

    except Exception as e:
        logger.error(f"Error during file upload: {e}")
        log_and_broadcast("ERROR", "Error processing Aadhaar upload.")
        return {"status": "error", "message": str(e)}

@app.post("/start-verification")
async def start_verification():
    await manager.broadcast_status("Verifying...", "orange")
    # Await the pipeline so we can return the steps structured JSON
    result = await run_verification_pipeline()
    return result

@app.websocket("/camera-stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep the connection alive. The camera_worker handles pushing frames.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
