"""
Configuration file for the application
"""

import os
from datetime import timedelta

class Config:
    """Base configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', False)
    TESTING = False
    
    # CORS Configuration
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ['http://localhost:8000', 'http://localhost:3000', '*']
    
    # API Configuration
    API_VERSION = '1.0.0'
    API_TITLE = 'AI Delivery Delay Prediction API'
    API_DESCRIPTION = 'Predict delivery delays using machine learning'
    
    # Timeout Configuration
    REQUEST_TIMEOUT = 30
    MODEL_PREDICTION_TIMEOUT = 5
    
    # File Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(BASE_DIR, 'backend', 'models')
    DATA_DIR = os.path.join(BASE_DIR, 'backend', 'data')
    
    # Database Configuration (if needed)
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    # SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cache Configuration
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # External API Keys
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')
    TRAFFIC_API_KEY = os.environ.get('TRAFFIC_API_KEY', '')
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.path.join(BASE_DIR, 'logs', 'app.log')
    
    # Model Configuration
    MODEL_ACCURACY_TARGET = 0.98
    MODEL_RETRAIN_INTERVAL = 7  # days
    
    # Prediction Limits
    MAX_DISTANCE = 5000  # km
    MIN_DISTANCE = 1     # km
    MAX_WAREHOUSE_DELAY = 1440  # minutes (24 hours)
    
    # Rate Limiting (if implemented)
    RATELIMIT_ENABLED = True
    RATELIMIT_REQUESTS = 100
    RATELIMIT_PERIOD = 3600  # seconds

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
