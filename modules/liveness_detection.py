import sys
import os
import cv2
from config import LIVENESS_MODEL_DIR, BASE_DIR
from logger import logger

# Add Silent-Face-Anti-Spoofing to sys.path
silent_face_path = os.path.join(BASE_DIR, "Silent-Face-Anti-Spoofing")
if silent_face_path not in sys.path:
    sys.path.append(silent_face_path)

try:
    from src.anti_spoof_predict import AntiSpoofPredict
    from src.generate_patches import CropImage
    from src.utility import parse_model_name
    logger.debug(f"Loading Liveness Model from {LIVENESS_MODEL_DIR}...")
    model_test = AntiSpoofPredict(0)  # Use GPU 0
    image_cropper = CropImage()
    logger.debug("Liveness model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load Liveness Model: {e}. Please ensure Silent-Face-Anti-Spoofing is set up correctly.")
    model_test = None
    image_cropper = None

def preprocess_for_liveness(frame):
    """
    Normalizes the frame for liveness detection by adjusting brightness and contrast
    and applying a slight blur to remove noise.
    """
    frame = cv2.GaussianBlur(frame, (3, 3), 0)
    frame = cv2.convertScaleAbs(frame, alpha=1.3, beta=20)
    return frame

def check_liveness_single_frame(frame, bbox):
    """
    Checks if the cropped face is real or spoofed on a single frame.
    Returns the real float confidence score (0.0 to 1.0).
    bbox format: [x, y, w, h]
    """
    if model_test is None or image_cropper is None:
        logger.error("Liveness model is not initialized.")
        return 0.0

    try:
        model_name = "2.7_80x80_MiniFASNetV2.pth"
        h_input, w_input, model_type, scale = parse_model_name(model_name)
        param = {
            "org_img": frame,
            "bbox": bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }
        
        img = image_cropper.crop(**param)
        model_path = os.path.join(LIVENESS_MODEL_DIR, model_name)
        result = model_test.predict(img, model_path)
        
        # result is a flat 1D array from softmax, e.g. [score_fake, score_real]
        # We want the score for label 1 (real)
        score = float(result[0][1] if len(result.shape) > 1 else result[1])
        return score
    except Exception as e:
        logger.error(f"Error during liveness check: {e}")
        return 0.0
