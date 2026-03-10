import sys
import time
import cv2
import numpy as np
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QFrame
)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QImage, QPixmap, QFont

from logger import logger
from modules.camera import Camera
from modules.pipeline_state import VerificationPipeline, VerificationState
from config import DETECTION_INTERVAL_MS

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Voting Kiosk AI Verification System")
        self.resize(1024, 768)

        # Core Components
        self.camera = Camera()
        self.camera.start()
        self.current_frame = None
        
        self.pipeline = VerificationPipeline(voter_id="voter1")
        self.last_detection_time = 0

        # UI Initialization
        self.init_ui()
        logger.info("UI initialized")

        # Camera Update Timer (Non-blocking loop)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(33) # ~30 fps

    def init_ui(self):
        # Central widget and main layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)

        # Left Panel (Camera View)
        left_layout = QVBoxLayout()
        self.camera_label = QLabel("Loading Camera...")
        self.camera_label.setAlignment(Qt.AlignCenter)
        self.camera_label.setMinimumSize(640, 480)
        self.camera_label.setStyleSheet("background-color: black; color: white;")
        self.camera_label.setFrameShape(QFrame.Box)
        
        # Big UX Message Label
        self.ux_label = QLabel("System Ready. Please face the camera.")
        self.ux_label.setAlignment(Qt.AlignCenter)
        self.ux_label.setFont(QFont("Arial", 20, QFont.Bold))
        self.ux_label.setStyleSheet("color: white; background-color: rgba(0,0,0,150); padding: 10px;")
        
        left_layout.addWidget(self.camera_label)
        left_layout.addWidget(self.ux_label)
        left_layout.setStretch(0, 1)
        
        # Right Panel (Controls and Status)
        right_layout = QVBoxLayout()
        
        # Status Label
        self.status_label = QLabel("Ready")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setFont(QFont("Arial", 16, QFont.Bold))
        self.status_label.setStyleSheet("color: blue; padding: 20px; border: 2px solid blue;")
        right_layout.addWidget(self.status_label)
        
        # Spacer
        right_layout.addStretch()

        # Buttons
        button_layout = QHBoxLayout()
        self.btn_start = QPushButton("Restart Verification")
        self.btn_start.setMinimumHeight(50)
        self.btn_start.setFont(QFont("Arial", 12, QFont.Bold))
        self.btn_start.clicked.connect(self.start_verification)
        
        self.btn_exit = QPushButton("Exit")
        self.btn_exit.setMinimumHeight(50)
        self.btn_exit.setFont(QFont("Arial", 12))
        self.btn_exit.clicked.connect(self.close)

        button_layout.addWidget(self.btn_start)
        button_layout.addWidget(self.btn_exit)

        right_layout.addLayout(button_layout)
        
        # Combine
        layout.addLayout(left_layout, stretch=2)
        layout.addLayout(right_layout, stretch=1)

    def update_frame(self):
        ret, frame = self.camera.read_frame()
        if not ret:
            return
            
        self.current_frame = frame
        
        # Run AI detection pipeline conditionally based on timer
        current_time = time.time() * 1000
        if current_time - self.last_detection_time >= DETECTION_INTERVAL_MS:
            self.pipeline.process(self.current_frame)
            self.last_detection_time = current_time
            
            # Update labels based on pipeline state
            self.update_ui_state()

        # Draw debug info overlays
        display_frame = self.pipeline.draw_debug_info(self.current_frame)

        # Convert BGR to RGB for Qt Image Display
        rgb_image = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        
        # Update camera image
        qt_image = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(qt_image)
        self.camera_label.setPixmap(pixmap.scaled(self.camera_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation))

    def update_ui_state(self):
        # Update UX user message
        self.ux_label.setText(self.pipeline.ux_message)
        
        # Update Verification State Label
        state_name = self.pipeline.state.name.replace("_", " ")
        color = "blue"
        if self.pipeline.state == VerificationState.VOTING_ALLOWED:
            color = "green"
        elif self.pipeline.liveness_status == "SPOOF":
            color = "red"
            
        self.status_label.setText(state_name)
        self.status_label.setStyleSheet(f"color: {color}; padding: 20px; border: 2px solid {color};")

    def start_verification(self):
        self.pipeline.reset_to_initial()
        self.update_ui_state()

    def closeEvent(self, event):
        self.camera.release()
        event.accept()
