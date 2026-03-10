import sys
import os
from config import LIVENESS_MODEL_DIR, BASE_DIR
from logger import logger

# Add Silent-Face-Anti-Spoofing to sys.path
silent_face_path = os.path.join(BASE_DIR, "Silent-Face-Anti-Spoofing")
if silent_face_path not in sys.path:
    sys.path.append(silent_face_path)

try:
    from src.anti_spoof_predict import AntiSpoofPredict
    logger.debug(f"Loading Liveness Model from {LIVENESS_MODEL_DIR}...")
    model_test = AntiSpoofPredict(0)  # Use GPU 0
    logger.debug("Liveness model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load Liveness Model: {e}. Please ensure Silent-Face-Anti-Spoofing is set up correctly.")
    model_test = None

def check_liveness_single_frame(frame_crop):
    """
    Checks if the cropped face is real or spoofed on a single frame.
    Returns True if real, False if spoof.
    """
    if model_test is None:
        logger.error("Liveness model is not initialized.")
        return False

    try:
        result = model_test.predict(frame_crop, LIVENESS_MODEL_DIR)
        label = result.argmax()
        is_live = (label == 1)
        
        if is_live:
            logger.debug("Liveness check passed (Real face).")
        else:
            logger.warning("Liveness check failed (Spoof attack detected!).")
            
        return is_live
    except Exception as e:
        logger.error(f"Error during liveness check: {e}")
        return False
