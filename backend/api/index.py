import sys
import os

# Make parent directory importable (Vercel runs from repo root)
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app  # noqa: F401 — Vercel needs this export
