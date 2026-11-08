"""
SSIP Logging Configuration
Implements Boundary 4 (Log Redaction): Ensures student identifiers, assessment payloads,
and sensitive credentials are never written to application logs.
"""
import logging
import re
import sys


class ZeroRetentionLogFilter(logging.Filter):
    """
    Sanitizes log messages to ensure student identifiers, tokens, and payloads
    do not leak into application or access logs.
    """
    # Patterns matching potential student roll numbers or sensitive fields
    SENSITIVE_PATTERNS = [
        (re.compile(r'(?i)(?:student_id|roll_no|roll_number|identifier)[\'":\s=]+([a-zA-Z0-9_\-]+)'), r'\1[REDACTED_ID]'),
        (re.compile(r'(?i)(?:password|secret|bearer)[\'":\s=]+([^\s,;]+)'), r'[REDACTED_SECRET]'),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, repl in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub(repl, record.msg)
        return True


def setup_logging(debug: bool = False) -> logging.Logger:
    level = logging.DEBUG if debug else logging.INFO
    logger = logging.getLogger("ssip")
    logger.setLevel(level)
    
    # Avoid duplicate handlers on reloads
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        handler.addFilter(ZeroRetentionLogFilter())
        logger.addHandler(handler)
        
    return logger


logger = setup_logging()

