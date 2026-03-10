import os
import sys
import cv2
import asyncio
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
from modules.liveness_detection import check_liveness_single_frame
from modules.face_verification import verify_face, load_voter_embedding
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
voter_id_target = "voter1"

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


manager = ConnectionManager()

def log_and_broadcast(level: str, message: str):
    if level == "INFO" or level == "SUCCESS":
        logger.info(message)
    elif level == "WARNING":
        logger.warning(message)
    else:
        logger.error(message)
    
    # Broadcast asynchronously
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast_log(level, message))
    except RuntimeError:
        pass # Handle cases where there is no running event loop

async def run_verification_pipeline(frame, voter_id):
    log_and_broadcast("INFO", "Starting verification pipeline...")
    
    # 1. Person Detection
    log_and_broadcast("INFO", "Detecting persons...")
    persons, _ = count_persons_and_get_boxes(frame)
    if persons != 1:
        log_and_broadcast("ERROR", f"Failed: Detected {persons} persons. Exactly 1 required.")
        await manager.broadcast_status("Multiple Persons Detected" if persons > 1 else "No Person Detected", "red")
        return

    # 2. Face Detection
    log_and_broadcast("INFO", "Extracting face...")
    faces = detect_faces(frame)
    if len(faces) != 1:
        log_and_broadcast("ERROR", f"Failed: Detected {len(faces)} faces.")
        await manager.broadcast_status("Face Not Detected" if len(faces) == 0 else "Multiple Faces", "red")
        return

    face = faces[0]
    x1, y1, x2, y2 = get_face_bbox(face)
    
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    face_crop = frame[y1:y2, x1:x2]

    # 3. Liveness Check
    log_and_broadcast("INFO", "Running liveness check...")
    is_live = check_liveness_single_frame(face_crop)
    if not is_live:
        log_and_broadcast("ERROR", "Failed: Spoof Attack Detected!")
        await manager.broadcast_status("Spoof Attack Detected", "red")
        return
        
    # 4. Face Verification
    log_and_broadcast("INFO", "Comparing face with database...")
    target_embedding = load_voter_embedding(voter_id)
    if target_embedding is None:
        log_and_broadcast("ERROR", f"Failed: Voter record '{voter_id}' not found.")
        await manager.broadcast_status("Database Error", "orange")
        return
        
    live_embedding = face.embedding
    is_match, score = verify_face(live_embedding, target_embedding)

    if is_match:
        log_and_broadcast("SUCCESS", f"Verification completed! Match score: {score*100:.1f}%")
        await manager.broadcast_status("Voter Verified", "green")
    else:
        log_and_broadcast("ERROR", f"Verification failed. Match score: {score*100:.1f}%")
        await manager.broadcast_status("Verification Failed", "red")


@app.on_event("startup")
async def startup_event():
    logger.info("Starting API Server. Pre-loading models...")
    # Models are already loaded at module import time in their respective files.
    # This prevents slow first-inference.
    camera.start()
    log_and_broadcast("INFO", "Camera subsystem and biometrics engine initialized.")

@app.on_event("shutdown")
async def shutdown_event():
    camera.release()
    logger.info("API Server shutdown.")

@app.get("/")
def read_root():
    return {"status": "Voting Kiosk API is running"}

@app.post("/start-verification")
async def start_verification():
    ret, frame = camera.read_frame()
    if not ret or frame is None:
        log_and_broadcast("ERROR", "Camera error: Cannot read frame.")
        return {"status": "error", "message": "Camera frame not available"}
        
    await manager.broadcast_status("Verifying...", "orange")
    
    # Run the AI pipeline as a background task
    asyncio.create_task(run_verification_pipeline(frame, voter_id_target))
    
    return {"status": "started"}

@app.websocket("/camera-stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            ret, frame = camera.read_frame()
            if ret:
                # Optionally process the frame (e.g., draw generic bounding boxes)
                # For streaming, we convert to JPEG
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                frame_b64 = base64.b64encode(buffer).decode('utf-8')
                
                await websocket.send_text(json.dumps({
                    "type": "frame",
                    "data": f"data:image/jpeg;base64,{frame_b64}"
                }))
            await asyncio.sleep(0.05)  # ~20fps to save bandwidth
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
