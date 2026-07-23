import os
import sys

# Add the project root to sys.path so 'backend' is importable as a package.
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Import the Flask WSGI app — Vercel looks for a top-level `app` variable.
from backend.app import app  # noqa: E402, F401
