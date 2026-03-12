"""
WSGI entry point for production deployment on Render
This module exports the Flask app for gunicorn to use
"""

import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app from backend/app.py
from app import app

# For development - don't use in production (gunicorn handles this)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not is_production,
        use_reloader=not is_production
    )
