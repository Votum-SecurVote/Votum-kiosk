from ultralytics import YOLO

# Load YOLO model once
model = YOLO("yolov8n.pt")

def count_persons(frame):

    results = model(frame)

    person_count = 0

    for r in results:
        for cls, conf in zip(r.boxes.cls, r.boxes.conf):

            # class 0 = person
            if int(cls) == 0 and conf > 0.5:
                person_count += 1

    return person_count