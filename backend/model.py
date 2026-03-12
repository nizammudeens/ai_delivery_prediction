"""
Machine Learning Model for Delivery Delay Prediction
Uses Scikit-Learn to train and predict delivery delays
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from datetime import datetime

class DeliveryDelayModel:
    """
    ML Model for predicting delivery delays using Random Forest
    """
    
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.delay_predictor = None
        self.probability_predictor = None
        self.scaler = StandardScaler()
        
    def train(self, X_train, y_train_delay, y_train_probability):
        """
        Train the ML models
        
        Parameters:
        - X_train: Training features
        - y_train_delay: Training target (delay duration in minutes)
        - y_train_probability: Training target (delay probability 0-100)
        """
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X_train)
        
        # Train delay duration predictor
        self.delay_predictor = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.delay_predictor.fit(X_scaled, y_train_delay)
        
        # Train delay probability predictor
        self.probability_predictor = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        # Convert delay probability to classes (0-30%, 30-60%, 60-100%)
        y_classes = np.digitize(y_train_probability, bins=[30, 60])
        self.probability_predictor.fit(X_scaled, y_classes)
        
        print("[✓] Models trained successfully")
        
    def predict(self, X_test):
        """
        Make predictions
        
        Returns dictionary with delay duration and probability
        """
        X_scaled = self.scaler.transform(X_test)
        
        delay_duration = self.delay_predictor.predict(X_scaled)
        delay_classes = self.probability_predictor.predict(X_scaled)
        
        # Convert classes back to probability ranges
        probability_map = {0: 15, 1: 45, 2: 75}
        delay_probability = np.array([probability_map.get(c, 45) for c in delay_classes])
        
        return {
            'delay_duration': delay_duration[0],
            'delay_probability': delay_probability[0]
        }
    
    def save(self):
        """Save model to disk"""
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
        
        with open(os.path.join(self.model_dir, 'delay_model.pkl'), 'wb') as f:
            pickle.dump(self.delay_predictor, f)
        
        with open(os.path.join(self.model_dir, 'probability_model.pkl'), 'wb') as f:
            pickle.dump(self.probability_predictor, f)
        
        with open(os.path.join(self.model_dir, 'scaler.pkl'), 'wb') as f:
            pickle.dump(self.scaler, f)
        
        print("[✓] Models saved successfully")
    
    def load(self):
        """Load model from disk"""
        try:
            with open(os.path.join(self.model_dir, 'delay_model.pkl'), 'rb') as f:
                self.delay_predictor = pickle.load(f)
            
            with open(os.path.join(self.model_dir, 'probability_model.pkl'), 'rb') as f:
                self.probability_predictor = pickle.load(f)
            
            with open(os.path.join(self.model_dir, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
            
            print("[✓] Models loaded successfully")
            return True
        except FileNotFoundError:
            print("[!] Model files not found. Please train first.")
            return False
    
    def get_feature_importance(self):
        """Get feature importance from the delay model"""
        if self.delay_predictor is None:
            return None
        
        return self.delay_predictor.feature_importances_
    
    def get_model_info(self):
        """Get model information"""
        return {
            'model_type': 'Random Forest',
            'delay_estimators': 100,
            'probability_estimators': 100,
            'trained': self.delay_predictor is not None,
            'training_date': datetime.now().isoformat()
        }


def generate_training_data(n_samples=1000):
    """
    Generate synthetic training data for the model
    
    Features:
    - distance: delivery distance in km (1-500)
    - traffic_level: traffic condition 1-4 (light to congested)
    - weather: weather condition 1-5 (clear to stormy)
    - warehouse_delay: warehouse processing time in minutes (0-120)
    - vehicle_type: 0=truck, 1=car, 2=bike, 3=ship, 4=airplane
    - hour_of_day: departure hour (0-23)
    - is_peak_hours: 0 or 1
    - is_holiday: 0 or 1
    """
    
    np.random.seed(42)
    
    # Generate features
    X = np.random.rand(n_samples, 8) * 100
    X[:, 0] = np.random.uniform(1, 500, n_samples)  # distance
    X[:, 1] = np.random.randint(1, 5, n_samples)    # traffic_level
    X[:, 2] = np.random.randint(1, 6, n_samples)    # weather
    X[:, 3] = np.random.uniform(0, 120, n_samples)  # warehouse_delay
    X[:, 4] = np.random.randint(0, 5, n_samples)    # vehicle_type
    X[:, 5] = np.random.randint(0, 24, n_samples)   # hour_of_day
    X[:, 6] = np.random.randint(0, 2, n_samples)    # is_peak_hours
    X[:, 7] = np.random.randint(0, 2, n_samples)    # is_holiday
    
    # Calculate target variables
    y_delay = (
        X[:, 0] / 60 * 10 +  # distance factor
        X[:, 1] * 15 +       # traffic factor
        (X[:, 2] - 1) * 10 + # weather factor
        X[:, 3] * 0.5 +      # warehouse delay factor
        X[:, 6] * 20 +       # peak hours multiplier
        X[:, 7] * 15 +       # holiday multiplier
        np.random.normal(0, 10, n_samples)  # noise
    )
    y_delay = np.maximum(0, y_delay)
    
    y_probability = (
        (X[:, 1] / 4) * 100 * 0.4 +        # traffic impact (40%)
        ((X[:, 2] - 1) / 4) * 100 * 0.35 + # weather impact (35%)
        (X[:, 3] / 120) * 100 * 0.25 +     # warehouse impact (25%)
        np.random.normal(0, 5, n_samples)  # noise
    )
    y_probability = np.clip(y_probability, 0, 100)
    
    return X, y_delay, y_probability


def train_initial_model():
    """Train initial model with synthetic data"""
    print("[*] Generating training data...")
    X, y_delay, y_probability = generate_training_data(1000)
    
    print("[*] Training models...")
    model = DeliveryDelayModel()
    model.train(X, y_delay, y_probability)
    
    print("[*] Saving models...")
    model.save()
    
    print("[✓] Initial model training complete")
    return model


if __name__ == '__main__':
    # Train model if run directly
    model = train_initial_model()
    print("\n[✓] Model ready for use")
