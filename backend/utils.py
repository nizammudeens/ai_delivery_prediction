"""
Utility functions for the Delivery Delay Prediction backend
"""

import numpy as np
from datetime import datetime, timedelta
import requests
import os

class DataProcessor:
    """Process and normalize input data"""
    
    VEHICLE_MAP = {
        'truck': 0,
        'car': 1,
        'bike': 2,
        'ship': 3,
        'airplane': 4
    }
    
    REVERSE_VEHICLE_MAP = {v: k for k, v in VEHICLE_MAP.items()}
    
    @staticmethod
    def process_input(data):
        """
        Convert input data to model features
        
        Input data format:
        {
            'vehicleType': string,
            'distance': float,
            'trafficLevel': int (1-4),
            'weatherCondition': int (1-5),
            'warehouseDelay': float,
            'departureTime': HH:MM,
            'isPeakHours': boolean,
            'isHoliday': boolean
        }
        """
        
        try:
            # Extract features
            vehicle_code = DataProcessor.VEHICLE_MAP.get(
                data.get('vehicleType', 'truck'), 0
            )
            distance = float(data.get('distance', 100))
            traffic_level = int(data.get('trafficLevel', 2))
            weather = int(data.get('weatherCondition', 1))
            warehouse_delay = float(data.get('warehouseDelay', 0))
            
            # Parse departure time
            time_str = data.get('departureTime', '09:00')
            is_peak = int(data.get('isPeakHours', False))
            is_holiday = int(data.get('isHoliday', False))
            
            # Calculate hour of day
            hour_of_day = int(time_str.split(':')[0])
            
            # Create feature vector
            features = np.array([
                distance,
                traffic_level,
                weather,
                warehouse_delay,
                vehicle_code,
                hour_of_day,
                is_peak,
                is_holiday
            ]).reshape(1, -1)
            
            return features
        
        except Exception as e:
            raise ValueError(f"Error processing input: {str(e)}")
    
    @staticmethod
    def calculate_base_time(distance, vehicle_type):
        """Calculate base delivery time without delays"""
        
        speeds = {
            'airplane': 500,
            'ship': 30,
            'truck': 80,
            'car': 100,
            'bike': 40
        }
        
        speed = speeds.get(vehicle_type, 80)
        # Time in minutes
        return (distance / speed) * 60


class PredictionProcessor:
    """Process model predictions into results"""
    
    @staticmethod
    def format_result(prediction, input_data):
        """
        Format model prediction into readable result
        
        Returns:
        {
            'success': bool,
            'estimatedDeliveryTime': float (minutes),
            'delayProbability': float (0-100),
            'predictedDelay': float (minutes),
            'status': string (on-time, warning, danger),
            'factors': {
                'traffic': float,
                'weather': float,
                'warehouse': float,
                'distance': float
            }
        }
        """
        
        try:
            vehicle_type = input_data.get('vehicleType', 'truck')
            distance = float(input_data.get('distance', 100))
            traffic = int(input_data.get('trafficLevel', 2))
            weather = int(input_data.get('weatherCondition', 1))
            warehouse_delay = float(input_data.get('warehouseDelay', 0))
            
            # Get base time
            base_time = DataProcessor.calculate_base_time(distance, vehicle_type)
            
            # Extract prediction values
            delay_duration = float(prediction['delay_duration'])
            delay_probability = float(prediction['delay_probability'])
            
            # Calculate total estimated time
            estimated_time = base_time + delay_duration
            
            # Determine status
            if delay_probability < 30:
                status = 'on-time'
            elif delay_probability < 60:
                status = 'warning'
            else:
                status = 'danger'
            
            # Calculate factor impacts
            traffic_impact = (traffic / 4) * 100 * 0.4
            weather_impact = ((weather - 1) / 4) * 100 * 0.35
            warehouse_impact = (warehouse_delay / 120) * 100 * 0.25
            distance_impact = (distance / 500) * 100 * 0.1
            
            total_impact = traffic_impact + weather_impact + warehouse_impact + distance_impact
            
            factors = {
                'traffic': round((traffic_impact / total_impact * 100) if total_impact > 0 else 0, 1),
                'weather': round((weather_impact / total_impact * 100) if total_impact > 0 else 0, 1),
                'warehouse': round((warehouse_impact / total_impact * 100) if total_impact > 0 else 0, 1),
                'distance': round((distance_impact / total_impact * 100) if total_impact > 0 else 0, 1)
            }
            
            return {
                'success': True,
                'estimatedDeliveryTime': round(estimated_time, 1),
                'delayProbability': round(delay_probability, 1),
                'predictedDelay': round(delay_duration, 1),
                'baseTime': round(base_time, 1),
                'status': status,
                'factors': factors,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


class WeatherAPIClient:
    """Interface with weather API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('WEATHER_API_KEY', '')
        self.base_url = 'https://api.openweathermap.org/data/2.5/weather'
    
    def get_weather(self, latitude, longitude):
        """
        Get current weather data
        
        Returns weather condition code (1-5):
        1: Clear/Sunny
        2: Cloudy
        3: Rainy
        4: Snowy
        5: Stormy
        """
        
        if not self.api_key:
            # Return mock data if no API key
            return {
                'condition': 1,
                'temperature': 20,
                'humidity': 60,
                'wind_speed': 10
            }
        
        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(self.base_url, params=params, timeout=5)
            data = response.json()
            
            # Map weather conditions
            condition_map = {
                'Clear': 1,
                'Clouds': 2,
                'Rain': 3,
                'Snow': 4,
                'Thunderstorm': 5
            }
            
            main_condition = data['weather'][0]['main']
            condition = condition_map.get(main_condition, 1)
            
            return {
                'condition': condition,
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed']
            }
        
        except Exception as e:
            print(f"Weather API error: {e}")
            return {'condition': 1, 'temperature': 20, 'humidity': 60, 'wind_speed': 10}


class TrafficAPIClient:
    """Interface with traffic API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('TRAFFIC_API_KEY', '')
        self.base_url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
    
    def get_traffic_level(self, origin_lat, origin_lon, dest_lat, dest_lon):
        """
        Get current traffic level
        
        Returns traffic level (1-4):
        1: Light
        2: Moderate
        3: Heavy
        4: Congested
        """
        
        if not self.api_key:
            # Return mock data
            return {
                'level': 2,
                'duration': 30,
                'distance': 100
            }
        
        try:
            params = {
                'origins': f'{origin_lat},{origin_lon}',
                'destinations': f'{dest_lat},{dest_lon}',
                'key': self.api_key,
                'traffic_model': 'best_guess',
                'departure_time': 'now'
            }
            
            response = requests.get(self.base_url, params=params, timeout=5)
            data = response.json()
            
            # Extract traffic information
            if data['status'] == 'OK':
                duration = data['rows'][0]['elements'][0].get('duration_in_traffic', {}).get('value', 0)
                traffic_level = min(4, max(1, int(duration / 600)))  # Simplified logic
                
                return {
                    'level': traffic_level,
                    'duration': duration / 60,  # in minutes
                    'distance': data['rows'][0]['elements'][0].get('distance', {}).get('value', 0) / 1000
                }
            else:
                return {'level': 2, 'duration': 30, 'distance': 100}
        
        except Exception as e:
            print(f"Traffic API error: {e}")
            return {'level': 2, 'duration': 30, 'distance': 100}


class TimeCalculator:
    """Calculate delivery times"""
    
    @staticmethod
    def parse_time(time_str):
        """Parse HH:MM time string to minutes from midnight"""
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        return hours * 60 + minutes
    
    @staticmethod
    def calculate_delivery_time(departure_time, duration_minutes):
        """
        Calculate delivery timestamp
        
        Args:
            departure_time: HH:MM string
            duration_minutes: float
        
        Returns:
            Delivery time as HH:MM string
        """
        
        departure_minutes = TimeCalculator.parse_time(departure_time)
        delivery_minutes = departure_minutes + duration_minutes
        
        # Handle day overflow (simple case, assume same day)
        delivery_minutes = delivery_minutes % (24 * 60)
        
        hours = int(delivery_minutes // 60)
        minutes = int(delivery_minutes % 60)
        
        return f"{hours:02d}:{minutes:02d}"
    
    @staticmethod
    def is_peak_hours(hour):
        """Check if hour is peak traffic hours"""
        return hour in [7, 8, 9, 17, 18, 19]  # 7-10am, 5-8pm


def validate_input(data):
    """Validate input data"""
    
    required_fields = [
        'vehicleType', 'distance', 'trafficLevel',
        'weatherCondition', 'warehouseDelay', 'departureTime'
    ]
    
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate ranges
    if not data.get('vehicleType') in ['truck', 'car', 'bike', 'ship', 'airplane']:
        raise ValueError("Invalid vehicle type")
    
    distance = float(data.get('distance', 0))
    if distance <= 0 or distance > 5000:
        raise ValueError("Invalid distance (must be 1-5000 km)")
    
    traffic = int(data.get('trafficLevel', 0))
    if traffic < 1 or traffic > 4:
        raise ValueError("Invalid traffic level (must be 1-4)")
    
    weather = int(data.get('weatherCondition', 0))
    if weather < 1 or weather > 5:
        raise ValueError("Invalid weather condition (must be 1-5)")
    
    return True
