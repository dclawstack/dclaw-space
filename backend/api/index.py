"""Vercel serverless entry point — imports the FastAPI ASGI app."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.main import app  # noqa: F401 — Vercel detects the `app` name
