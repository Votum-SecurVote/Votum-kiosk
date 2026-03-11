from insightface.app import FaceAnalysis
from config import FACE_MIN_SIZE
from logger import logger

try:
    logger.debug("Initializing InsightFace for face detection...")
    app = FaceAnalysis()
    app.prepare(ctx_id=0)  # Use GPU if available, else CPU
    logger.debug("InsightFace app prepared successfully.")
except Exception as e:
    logger.error(f"Failed to initialize InsightFace: {e}")
    app = None

def detect_faces(frame):
    """
    Detects faces in a frame using InsightFace ArcFace.
    Returns a list of face objects containing bounding boxes, keypoints, and embeddings.
    """
    if app is None:
        logger.error("InsightFace app is not initialized.")
        return []

    try:
        faces = app.get(frame)
        valid_faces = []
        for face in faces:
            x1, y1, x2, y2 = get_face_bbox(face)
            w = x2 - x1
            h = y2 - y1
            if w >= FACE_MIN_SIZE and h >= FACE_MIN_SIZE:
                valid_faces.append(face)
                
        if len(valid_faces) > 1:
            # Drop faces that are much smaller than the largest face (background faces)
            valid_faces.sort(key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]), reverse=True)
            max_area = (valid_faces[0].bbox[2]-valid_faces[0].bbox[0]) * (valid_faces[0].bbox[3]-valid_faces[0].bbox[1])
            valid_faces = [f for f in valid_faces if (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]) > max_area * 0.3]
            
        return valid_faces
    except Exception as e:
        logger.error(f"Error during face detection: {e}")
        return []

def get_face_bbox(face):
    """
    Returns integer coordinates of a face bounding box (x1, y1, x2, y2).
    """
    return tuple(map(int, face.bbox))
