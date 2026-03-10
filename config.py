import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODULES_DIR = os.path.join(BASE_DIR, "modules")
VOTERS_DIR = os.path.join(BASE_DIR, "voters")
LOGS_DIR = os.path.join(BASE_DIR, "logs")
UI_DIR = os.path.join(BASE_DIR, "ui")

# Ensure directories exist
os.makedirs(VOTERS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Hardware Config
CAMERA_INDEX = 0

# Detection Config
YOLO_MODEL_PATH = "yolov8n.pt"
LIVENESS_MODEL_DIR = os.path.join(BASE_DIR, "Silent-Face-Anti-Spoofing", "resources", "anti_spoof_models")

# Verification Config
SIMILARITY_THRESHOLD = 0.5  # Cosine similarity threshold for InsightFace embeddings

YOLO_CONF_THRESH = 0.6
PERSON_MIN_WIDTH = 80
PERSON_MIN_HEIGHT = 120
PERSON_IOU_THRESH = 0.4
PERSON_HISTORY_LEN = 5

FACE_MIN_SIZE = 50
FACE_HISTORY_LEN = 3

DETECTION_INTERVAL_MS = 300
LIVENESS_FRAMES = 10
LIVENESS_THRESHOLD = 0.6
COOLDOWN_MS = 1000
