import sys
import os

# Expose backend package to Python importer
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: F401  — Vercel picks up this 'app' variable
