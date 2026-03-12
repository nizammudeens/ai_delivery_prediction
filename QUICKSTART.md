# Quick Start Guide

## AI Delivery Delay Prediction System - Setup Instructions

### ⚡ Quick Setup (5 minutes)

#### Step 1: Install Python Dependencies

```bash
# Navigate to project directory
cd web

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 2: Train the ML Model

```bash
# Navigate to backend
cd backend

# Train the model (generates model files)
python model.py

# Go back to project root
cd ..
```

#### Step 3: Start the Backend Server

```bash
# Start Flask server
python backend/app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

#### Step 4: Open Frontend in Browser

**Option A: Direct File Opening**
- Open `frontend/index.html` in your web browser

**Option B: Local Server (Recommended)**

```bash
# In a new terminal, from the frontend directory
cd frontend
python -m http.server 8000
```

Then visit: `http://localhost:8000`

---

## 🧪 Testing the Application

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Make a Prediction
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "truck",
    "distance": 150,
    "trafficLevel": 2,
    "weatherCondition": 1,
    "warehouseDelay": 30,
    "departureTime": "09:00"
  }'
```

### 3. Get Model Info
```bash
curl http://localhost:5000/api/model/info
```

---

## 📖 Using the Application

### Home Page
1. Open `http://localhost:8000` (or local file)
2. Review the problem statement and features
3. Click "Start Prediction" or "Predict Delay"

### Prediction Form
1. **Vehicle Type**: Select from Truck, Car, Bike, Ship, Airplane
2. **Distance**: Enter delivery distance in km (1-5000)
3. **Traffic Level**: Choose from Light (1) to Congested (4)
4. **Weather**: Select from Clear (1) to Stormy (5)
5. **Warehouse Delay**: Enter preparation time in minutes
6. **Departure Time**: Set the pickup time
7. Click **Predict Delay**

### Results Page
- View predicted delivery time and delay probability
- See impact of each factor
- Review recommendations
- Print or share results

### Live Tracking
- Monitor vehicle location on interactive map
- View real-time updates
- Track distance, speed, and ETA
- See delay risk assessment

---

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env` file in project root:

```
WEATHER_API_KEY=your_openweathermap_api_key
TRAFFIC_API_KEY=your_google_maps_api_key
FLASK_ENV=development
DEBUG=True
```

### Change Backend Port

Edit `backend/app.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Change port here
```

---

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check server status |
| `/api/predict` | POST | Make single prediction |
| `/api/predict-batch` | POST | Batch predictions |
| `/api/weather` | GET | Get weather data |
| `/api/traffic` | GET | Get traffic data |
| `/api/model/info` | GET | Model information |
| `/api/statistics` | GET | System statistics |
| `/api/monitor` | GET | System health |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows: Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux: 
lsof -ti:5000 | xargs kill -9
```

### CORS Issues
- Ensure `Flask-CORS` is installed: `pip install Flask-CORS`
- Check that `CORS(app)` is in `backend/app.py`

### Model Not Loading
```bash
# Retrain the model
cd backend
python model.py
```

### JavaScript Errors
- Open browser console (F12)
- Check for API URL errors
- Ensure backend is running on port 5000

---

## 🎯 Default Test Data

Form fields auto-fill with:
- Vehicle: Truck
- Distance: 150 km
- Traffic: Moderate
- Weather: Clear
- Warehouse: 30 minutes
- Time: Current time

Just click "Predict Delay" to test!

---

## 📱 Mobile Testing

Open on mobile device:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
2. Access: `http://<your-ip>:8000`
3. Homepage should load with responsive design

---

## ✨ Features Checklist

- ✅ AI ML model (Random Forest)
- ✅ 5 web pages
- ✅ Form validation
- ✅ Real-time predictions
- ✅ Charts and visualizations
- ✅ Live tracking map
- ✅ REST API
- ✅ Responsive design
- ✅ Local storage
- ✅ Error handling

---

## 📚 Next Steps

1. **Explore the code**: Check `frontend/js/` and `backend/` files
2. **Customize**: Modify colors, text, and branding
3. **Deploy**: Use Heroku, AWS, or DigitalOcean
4. **Integrate Real APIs**: Add actual weather/traffic data
5. **Add Database**: Connect PostgreSQL for data persistence

---

**Happy coding! 🚀**
