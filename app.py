"""
Root-level app.py for Render deployment
This file allows gunicorn to find the app without needing Procfile
"""

from backend.app import app

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not is_production,
        use_reloader=not is_production
    )
