import logging
import os
from config import LOGS_DIR
from datetime import datetime

# Format logging: [TIME] [LEVEL] MESSAGE
LOG_FORMAT = "[%(asctime)s] [%(levelname)s] %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

class AppLogger:
    @staticmethod
    def get_logger(name="VotingKiosk"):
        logger = logging.getLogger(name)
        
        # Avoid duplicate handlers
        if not logger.handlers:
            logger.setLevel(logging.DEBUG)

            # Console Handler
            ch = logging.StreamHandler()
            ch.setLevel(logging.INFO)
            formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
            ch.setFormatter(formatter)
            logger.addHandler(ch)

            # File Handler
            log_file = os.path.join(LOGS_DIR, f"system_{datetime.now().strftime('%Y%m%d')}.log")
            fh = logging.FileHandler(log_file)
            fh.setLevel(logging.DEBUG)
            fh.setFormatter(formatter)
            logger.addHandler(fh)

        return logger

# Global logger instance
logger = AppLogger.get_logger()
