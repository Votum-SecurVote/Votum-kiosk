Pavan — your document is already very strong. I cleaned it, fixed small wording issues, improved structure slightly, and formatted it like a **professional GitHub README**. You can **copy this directly as your final README.md**.

---

# AI Voting Kiosk Verification System

Welcome to the **AI Voting Kiosk Verification System**!
This project is a **production-style AI-powered kiosk application** that uses **computer vision and biometric verification** to authenticate voters securely before allowing them to proceed with voting.

![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Computer Vision](https://img.shields.io/badge/AI-Computer%20Vision-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 1. Project Introduction

## What the system does

This system acts as an **AI-powered security layer for digital kiosks**.
Before a voter is allowed to vote, the system verifies three critical rules using a webcam.

### Rule of One

Ensures **exactly one person** is standing in front of the kiosk.

### Liveness Detection

Ensures the person is **physically present and real**, preventing spoof attacks such as:

* printed photographs
* mobile screen replays
* masks or deepfake videos

### Identity Verification

Ensures the detected face **matches the registered voter** stored in the system database.

---

## Why it is needed

Traditional kiosks rely on:

* PIN codes
* ID cards
* manual identity verification

These methods can be **stolen, shared, or impersonated**.

By introducing **AI-based biometric verification**, the system ensures that:

* the **actual voter is physically present**
* **fraudulent voting attempts are prevented**
* **privacy and security are maintained**

---

## Real-world use cases

This architecture can be used in many secure environments:

* **Secure E-Voting Kiosks**
  Preventing fraudulent voting in digital voting booths.

* **Airport Biometric Gates**
  Automated passenger verification during boarding.

* **Automated Exam Proctoring Systems**
  Ensuring the correct student is taking the exam.

* **Secure Identity Verification Terminals**
  Banking kiosks, restricted facilities, and government systems.

---

# 2. Technology Stack

| Layer              | Technology                          |
| ------------------ | ----------------------------------- |
| Frontend           | Next.js 14 + React 18 + TailwindCSS |
| Backend            | FastAPI                             |
| AI Framework       | PyTorch                             |
| Computer Vision    | OpenCV                              |
| Person Detection   | YOLOv8                              |
| Face Recognition   | InsightFace (ArcFace)               |
| Liveness Detection | SilentFace Anti-Spoofing            |
| Communication      | WebSockets                          |

---

# 3. System Architecture

The system follows a **modern full-stack AI architecture**.

```
+-----------------------+
|  Browser (Next.js)    |
|  User Interface & UI  |
+-----------+-----------+
            |
            | REST / WebSocket
            v
+-----------------------+
|   FastAPI Backend     |
|   API & Orchestration |
+-----------+-----------+
            |
            v
+-----------------------+
| AI Processing Modules |
| Camera + Detection    |
+-----------+-----------+
            |
            v
+-----------------------+
| Computer Vision AI    |
| YOLOv8  → Person Count|
| InsightFace → Face ID |
| SilentFace → Liveness |
+-----------------------+
```

---

## Architecture Components

### Frontend (Next.js)

The **user interface of the kiosk**.

Responsibilities:

* display live camera feed
* show verification status
* display real-time logs
* allow the user to start or retry verification

---

### Backend (FastAPI)

Acts as the **bridge between the UI and AI models**.

Responsibilities:

* load AI models once at startup
* capture webcam frames
* process AI verification pipeline
* stream results to frontend using WebSockets

---

### AI Modules

Python modules responsible for **processing images and making decisions**.

---

# 4. AI Models Used

## YOLOv8

Purpose: **Person detection**

Used to ensure **only one person is present in front of the kiosk**.

Model file:

```
yolov8n.pt
```

---

## InsightFace (ArcFace)

Purpose: **Face recognition**

The system converts a face image into a **512-dimensional embedding vector**.

This vector acts as a **mathematical representation of the face**.

The vector is then compared against the registered voter database.

---

## SilentFace Anti-Spoofing

Purpose: **Liveness detection**

Detects spoof attacks such as:

* printed photos
* phone screens
* replayed videos
* deepfake attempts

Only **real human faces pass the verification step**.

---

# 6. AI Verification Pipeline

The system follows a strict **multi-stage verification pipeline**.

```
User stands in front of camera
        ↓
Capture webcam frame
        ↓
YOLOv8 person detection
        ↓
Is person count = 1 ?
   /           \
 No             Yes
Reject       Face detection
                 ↓
           Liveness check
                 ↓
         Generate face embedding
                 ↓
        Compare with voter database
                 ↓
       Similarity > threshold ?
        /              \
      No                Yes
    Reject           Verified
```

---

## Pipeline Steps

### Step 1 – Capture Frame

The system captures a frame from the webcam.

---

### Step 2 – Person Detection

YOLOv8 detects how many people are present.

If **more than one person** is detected → **verification fails**.

---

### Step 3 – Face Detection

InsightFace detects the face region and extracts facial landmarks.

---

### Step 4 – Liveness Detection

SilentFace verifies that the face is **real and not a spoof**.

---

### Step 5 – Face Embedding Generation

ArcFace converts the face into a **512-dimensional vector**.

---

### Step 6 – Face Comparison

The system calculates **cosine similarity** between:

* live face embedding
* stored voter embedding

---

### Step 7 – Final Decision

If similarity exceeds the threshold → **Voter Verified**

Otherwise → **Verification Failed**

---

# 7. API Backend Explanation

The backend is implemented using **FastAPI**.

FastAPI allows high-performance asynchronous APIs for AI workloads.

---

## Model Initialization

All AI models are **loaded once at server startup**.

This prevents repeated loading delays and ensures **fast inference**.

---

## WebSocket Streaming

Instead of sending repeated HTTP requests, the backend streams camera frames using **WebSockets**, enabling real-time communication between the browser and the AI backend.

---

## API Endpoints

### Start Verification

```
POST /start-verification
```

Starts the AI verification pipeline.

---

### Camera Stream

```
WebSocket /camera-stream
```

Streams live webcam frames and verification logs to the frontend.

---

### Health Check

```
GET /
```

Used to verify the backend server is running.

---

# 8. Frontend Explanation

The frontend is built using **Next.js and Tailwind CSS**.

---

## Pages

### Landing Page

Path:

```
/
```

Displays:

* language selection
* preparation checklist
* start verification button

---

### Verification Page

Path:

```
/verification
```

Displays the real-time AI verification interface.

---

## UI Components

### Camera Feed

Displays the webcam feed with scanning overlay.

---

### Verification Status Panel

Displays current system state:

* SYSTEM READY
* ANALYZING
* PASSED
* FAILED

---

### System Logs

Displays real-time logs from the AI pipeline.

Log colors:

| Log Level | Color  |
| --------- | ------ |
| INFO      | Blue   |
| SUCCESS   | Green  |
| WARNING   | Orange |
| ERROR     | Red    |

---

### Control Buttons

* Start Verification
* Retry Scan
* Exit

---

# 9. System Requirements

Before running the project, ensure the following are installed.

| Software | Version         |
| -------- | --------------- |
| Python   | 3.9+            |
| Node.js  | 18+             |
| npm      | 9+              |
| Webcam   | Any USB webcam  |
| RAM      | 8GB recommended |

Optional for faster inference:

* NVIDIA GPU with CUDA

---

# 10. Installation Guide

## Step 1 — Clone the Repository

```
git clone <repo-url>
cd voting-kiosk-ai
```

---

## Step 2 — Install Backend Dependencies

```
pip install fastapi uvicorn websockets python-multipart opencv-python ultralytics torch insightface onnxruntime numpy scikit-learn
```

---

## Step 3 — Install Frontend Dependencies

```
cd frontend
npm install
```

---

## Step 4 — Run Backend

Open a new terminal:

```
cd api
python -m uvicorn main:app --reload
```

---

## Step 5 — Run Frontend

Open another terminal:

```
cd frontend
npm run dev
```

---

## Step 6 — Open the Application

```
http://localhost:3000
```

---

# 11. Running Using Scripts

## Windows

```
.\start.bat
```

---

## Linux / Mac

```
chmod +x start.sh
./start.sh
```

These scripts start:

* FastAPI backend (port 8000)
* Next.js frontend (port 3000)

Press **CTRL + C** to stop both services.

---

# 12. Testing the System

Open the system:

```
http://localhost:3000
```

Click **Start Verification**.

---

## Scenario 1 — Valid Voter

Action:

Sit alone in front of the camera.

Expected result:

```
[SUCCESS] Verification completed
Match score: 98%
```

Status panel becomes **PASSED**.

---

## Scenario 2 — Multiple Persons

Action:

Stand with another person in frame.

Expected result:

```
[ERROR] Detected 2 persons
```

Status becomes **FAILED**.

---

## Scenario 3 — Spoof Attack

Action:

Hold a phone displaying your photo.

Expected result:

```
[ERROR] Spoof attack detected
```

Status becomes **FAILED**.

---

# 13. Troubleshooting

| Issue               | Cause               | Fix                    |
| ------------------- | ------------------- | ---------------------- |
| Camera not detected | Webcam in use       | Close other apps       |
| Models not loading  | Missing packages    | Reinstall dependencies |
| WebSocket errors    | Backend not running | Start FastAPI server   |
| Slow inference      | CPU-only processing | Use GPU                |

---

# 14. Future Improvements

Possible enhancements:

* Voter database using **PostgreSQL or MongoDB**
* **Government ID OCR scanning**
* **Docker containerization**
* **Cloud deployment (AWS / GCP)**
* **GPU acceleration using CUDA**

