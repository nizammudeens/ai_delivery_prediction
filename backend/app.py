"""
AI Delivery Delay Prediction System - Flask Backend
Main application file with API endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

from .model import DeliveryDelayModel, train_initial_model
from .utils import (
    DataProcessor, PredictionProcessor, WeatherAPIClient,
    TrafficAPIClient, TimeCalculator, validate_input
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize model
model = DeliveryDelayModel()
weather_client = WeatherAPIClient()
traffic_client = TrafficAPIClient()

# Load or train model
if not model.load():
    print("[*] Training initial model...")
    train_initial_model()
    model.load()

print("[✓] Application initialized successfully")


# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check API health"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200


# ============================================
# PREDICTION ENDPOINT
# ============================================

@app.route('/api/predict', methods=['POST'])
def predict_delay():
    """
    Main prediction endpoint
    
    Input JSON:
    {
        'vehicleType': 'truck|car|bike|ship|airplane',
        'distance': float (km),
        'trafficLevel': int (1-4),
        'weatherCondition': int (1-5),
        'warehouseDelay': float (minutes),
        'departureTime': 'HH:MM',
        'isPeakHours': boolean,
        'isHoliday': boolean
    }
    """
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate input
        validate_input(data)
        
        # Process input to features
        features = DataProcessor.process_input(data)
        
        # Make prediction
        prediction = model.predict(features)
        
        # Format result
        result = PredictionProcessor.format_result(prediction, data)
        
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    except Exception as e:
        print(f"[!] Error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


# ============================================
# BATCH PREDICTION ENGINE
# ============================================

@app.route('/api/predict-batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint for multiple deliveries
    
    Input JSON:
    {
        'predictions': [
            {...prediction_data...},
            {...prediction_data...}
        ]
    }
    """
    
    try:
        data = request.get_json()
        
        if not data or 'predictions' not in data:
            return jsonify({'error': 'Missing predictions array'}), 400
        
        predictions_list = data['predictions']
        results = []
        
        for pred_data in predictions_list:
            try:
                # Validate and process
                validate_input(pred_data)
                features = DataProcessor.process_input(pred_data)
                prediction = model.predict(features)
                result = PredictionProcessor.format_result(prediction, pred_data)
                results.append(result)
            except Exception as e:
                results.append({'error': str(e)})
        
        return jsonify({
            'success': True,
            'total': len(results),
            'results': results
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


# ============================================
# WEATHER ENDPOINT
# ============================================

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """
    Get weather information
    
    Query parameters:
    - lat: latitude
    - lon: longitude
    """
    
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        
        if lat is None or lon is None:
            return jsonify({'error': 'Missing latitude or longitude'}), 400
        
        weather_data = weather_client.get_weather(lat, lon)
        
        return jsonify({
            'success': True,
            'data': weather_data,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================
# TRAFFIC ENDPOINT
# ============================================

@app.route('/api/traffic', methods=['GET'])
def get_traffic():
    """
    Get traffic information
    
    Query parameters:
    - origin_lat, origin_lon: departure coordinates
    - dest_lat, dest_lon: destination coordinates
    """
    
    try:
        origin_lat = request.args.get('origin_lat', type=float)
        origin_lon = request.args.get('origin_lon', type=float)
        dest_lat = request.args.get('dest_lat', type=float)
        dest_lon = request.args.get('dest_lon', type=float)
        
        if None in [origin_lat, origin_lon, dest_lat, dest_lon]:
            return jsonify({'error': 'Missing location parameters'}), 400
        
        traffic_data = traffic_client.get_traffic_level(
            origin_lat, origin_lon, dest_lat, dest_lon
        )
        
        return jsonify({
            'success': True,
            'data': traffic_data,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================
# MODEL INFORMATION ENDPOINT
# ============================================

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get model information and statistics"""
    
    try:
        info = model.get_model_info()
        
        return jsonify({
            'success': True,
            'model': info,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# MODEL TRAINING ENDPOINT
# ============================================

@app.route('/api/model/train', methods=['POST'])
def train_model():
    """
    Retrain the model with new data
    
    Input JSON:
    {
        'X_train': array,
        'y_train_delay': array,
        'y_train_probability': array
    }
    """
    
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['X_train', 'y_train_delay', 'y_train_probability']):
            return jsonify({'error': 'Missing training data'}), 400
        
        # Re-train model
        model.train(
            data['X_train'],
            data['y_train_delay'],
            data['y_train_probability']
        )
        model.save()
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# STATISTICS ENDPOINT
# ============================================

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get prediction statistics"""
    
    # Mock statistics
    statistics = {
        'total_predictions': 50000,
        'accuracy_rate': 98.5,
        'avg_delay_reduction': 25,
        'active_users': 1250,
        'vehicles_tracked': 5000,
        'uptime_hours': 8760,
        'avg_response_time_ms': 245
    }
    
    return jsonify({
        'success': True,
        'statistics': statistics,
        'timestamp': datetime.now().isoformat()
    }), 200


# ============================================
# HEALTH MONITORING ENDPOINT
# ============================================

@app.route('/api/monitor', methods=['GET'])
def monitor():
    """System health monitoring"""
    
    monitor_data = {
        'system': {
            'status': 'healthy',
            'uptime_seconds': 3600,
            'memory_usage_mb': 150,
            'cpu_usage_percent': 25
        },
        'api': {
            'requests_processed': 1500,
            'errors': 5,
            'avg_response_time_ms': 245
        },
        'model': {
            'status': 'loaded',
            'last_training': datetime.now().isoformat(),
            'accuracy': 98.5
        }
    }
    
    return jsonify({
        'success': True,
        'data': monitor_data,
        'timestamp': datetime.now().isoformat()
    }), 200


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


# ============================================
# CORS Configuration
# ============================================

@app.before_request
def handle_preflight():
    """Handle CORS preflight requests"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response


if __name__ == '__main__':
    # Get port from environment variable or use default for development
    port = int(os.environ.get('PORT', 5000))
    
    # Determine if in production
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    # Development server
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not is_production,
        use_reloader=not is_production
    )
