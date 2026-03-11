from ultralytics import YOLO
from config import YOLO_MODEL_PATH, YOLO_CONF_THRESH, PERSON_MIN_WIDTH, PERSON_MIN_HEIGHT, PERSON_IOU_THRESH
from logger import logger
import numpy as np

try:
    logger.debug(f"Loading YOLO model from {YOLO_MODEL_PATH}...")
    model = YOLO(YOLO_MODEL_PATH)
    logger.debug("YOLO model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None

def bb_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    if interArea == 0: return 0.0

    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)

    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

def count_persons_and_get_boxes(frame):
    if model is None:
        logger.error("YOLO model is not initialized.")
        return 0, []

    results = model(frame, verbose=False)
    
    valid_boxes = []

    for r in results:
        # Check if boxes exist
        if r.boxes is None or len(r.boxes) == 0:
            continue
            
        for box, cls, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
            if int(cls) == 0 and conf >= YOLO_CONF_THRESH:
                x1, y1, x2, y2 = box.tolist()
                w = x2 - x1
                h = y2 - y1
                if w >= PERSON_MIN_WIDTH and h >= PERSON_MIN_HEIGHT:
                    valid_boxes.append([x1, y1, x2, y2, float(conf)])

    # Custom NMS / IoU Merger
    final_boxes = []
    while valid_boxes:
        valid_boxes.sort(key=lambda x: x[4], reverse=True) # Sort by confidence
        best_box = valid_boxes.pop(0)
        final_boxes.append(best_box)
        
        # Remove overlapping boxes
        new_valid_boxes = []
        for box in valid_boxes:
            if bb_iou(best_box[:4], box[:4]) < PERSON_IOU_THRESH:
                new_valid_boxes.append(box)
        valid_boxes = new_valid_boxes

    if len(final_boxes) > 1:
        # Drop boxes that are much smaller than the largest person (e.g. background people or photos)
        final_boxes.sort(key=lambda b: (b[2]-b[0]) * (b[3]-b[1]), reverse=True)
        max_area = (final_boxes[0][2]-final_boxes[0][0]) * (final_boxes[0][3]-final_boxes[0][1])
        final_boxes = [b for b in final_boxes if (b[2]-b[0]) * (b[3]-b[1]) > max_area * 0.3]

    return len(final_boxes), final_boxes
