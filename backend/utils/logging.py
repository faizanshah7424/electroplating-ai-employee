import logging
import sys

# Configure logging format
logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format=logging_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

def get_logger(name: str):
    return logging.getLogger(name)
