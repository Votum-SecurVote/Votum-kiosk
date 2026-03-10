import sys
import cv2
import os

sys.path.append("Silent-Face-Anti-Spoofing")

from src.anti_spoof_predict import AntiSpoofPredict

model_dir = "Silent-Face-Anti-Spoofing/resources/anti_spoof_models"

model_test = AntiSpoofPredict(0)


def check_liveness(frame):

    result = model_test.predict(frame, model_dir)

    label = result.argmax()

    if label == 1:
        return True
    else:
        return False