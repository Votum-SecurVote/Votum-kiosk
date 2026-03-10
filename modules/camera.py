import cv2
from logger import logger
from config import CAMERA_INDEX

class Camera:
    def __init__(self, camera_index=CAMERA_INDEX):
        self.camera_index = camera_index
        self.cap = None

    def start(self):
        self.cap = cv2.VideoCapture(self.camera_index)
        if not self.cap.isOpened():
            logger.error(f"Failed to open camera on index {self.camera_index}.")
            return False
        logger.info("Camera started successfully.")
        return True

    def read_frame(self):
        if self.cap is None or not self.cap.isOpened():
            return False, None
        return self.cap.read()

    def release(self):
        if self.cap:
            self.cap.release()
            self.cap = None
        logger.info("Camera released.")
