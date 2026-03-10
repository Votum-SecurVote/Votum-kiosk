import sys
import os

# Ensure modules are in path 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from PyQt5.QtWidgets import QApplication
from ui.main_window import MainWindow
from logger import logger

def main():
    logger.info("Starting Voting Kiosk AI Verification System...")
    
    app = QApplication(sys.argv)
    
    try:
        window = MainWindow()
        window.show()
        sys.exit(app.exec_())
    except Exception as e:
        logger.error(f"Application crashed: {e}")

if __name__ == '__main__':
    main()