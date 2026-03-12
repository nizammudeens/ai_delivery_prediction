# API Documentation

## AI Delivery Delay Prediction System - REST API Reference

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Content-Type**: `application/json`

---

## Table of Contents

1. [Health Check](#health-check)
2. [Predictions](#predictions)
3. [Data APIs](#data-apis)
4. [Model Management](#model-management)
5. [System Information](#system-information)
6. [Error Handling](#error-handling)

---

## Health Check

### GET /health

Check if the API is running and healthy.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-11T10:30:45.123456",
  "version": "1.0.0"
}
```

---

## Predictions

### POST /predict

Make a single delivery delay prediction.

**Request:**
```http
POST /api/predict HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "vehicleType": "truck",
  "distance": 150,
  "trafficLevel": 2,
  "weatherCondition": 1,
  "warehouseDelay": 30,
  "departureTime": "09:00",
  "isPeakHours": false,
  "isHoliday": false
}
```

**Parameters:**

| Parameter | Type | Required | Range | Description |
|-----------|------|----------|-------|-------------|
| vehicleType | string | Yes | truck, car, bike, ship, airplane | Type of delivery vehicle |
| distance | number | Yes | 1-5000 | Distance in kilometers |
| trafficLevel | integer | Yes | 1-4 | Traffic condition (1=light, 4=congested) |
| weatherCondition | integer | Yes | 1-5 | Weather (1=clear, 5=stormy) |
| warehouseDelay | number | Yes | 0-1440 | Warehouse processing time in minutes |
| departureTime | string | Yes | HH:MM | Departure time in 24-hour format |
| isPeakHours | boolean | No | true, false | Whether it's peak traffic hours |
| isHoliday | boolean | No | true, false | Whether it's a holiday/weekend |

**Response (200 OK):**
```json
{
  "success": true,
  "estimatedDeliveryTime": 245.5,
  "delayProbability": 35.2,
  "predictedDelay": 45.5,
  "baseTime": 200,
  "status": "warning",
  "factors": {
    "traffic": 65.0,
    "weather": 20.0,
    "warehouse": 10.0,
    "distance": 5.0
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether prediction was successful |
| estimatedDeliveryTime | number | Total delivery time in minutes |
| delayProbability | number | Probability of delay (0-100%) |
| predictedDelay | number | Expected delay duration in minutes |
| status | string | on-time, warning, or danger |
| factors | object | Contribution of each factor |
| timestamp | string | ISO timestamp of prediction |

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required field: vehicleType"
}
```

---

### POST /predict-batch

Make multiple predictions in one request.

**Request:**
```http
POST /api/predict-batch HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "predictions": [
    {
      "vehicleType": "truck",
      "distance": 150,
      "trafficLevel": 2,
      "weatherCondition": 1,
      "warehouseDelay": 30,
      "departureTime": "09:00"
    },
    {
      "vehicleType": "car",
      "distance": 80,
      "trafficLevel": 3,
      "weatherCondition": 2,
      "warehouseDelay": 15,
      "departureTime": "10:30"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "total": 2,
  "results": [
    {
      "success": true,
      "estimatedDeliveryTime": 245.5,
      ...
    },
    {
      "success": true,
      "estimatedDeliveryTime": 150.3,
      ...
    }
  ]
}
```

---

## Data APIs

### GET /weather

Get weather information for location.

**Request:**
```http
GET /api/weather?lat=37.7749&lon=-122.4194 HTTP/1.1
Host: localhost:5000
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude coordinate |
| lon | number | Yes | Longitude coordinate |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "condition": 2,
    "temperature": 20.5,
    "humidity": 65,
    "wind_speed": 12.3
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

**Weather Conditions:**
- 1: Clear/Sunny
- 2: Cloudy
- 3: Rainy
- 4: Snowy
- 5: Stormy

---

### GET /traffic

Get traffic information for route.

**Request:**
```http
GET /api/traffic?origin_lat=37.7749&origin_lon=-122.4194&dest_lat=37.8044&dest_lon=-122.2712 HTTP/1.1
Host: localhost:5000
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| origin_lat | number | Yes | Origin latitude |
| origin_lon | number | Yes | Origin longitude |
| dest_lat | number | Yes | Destination latitude |
| dest_lon | number | Yes | Destination longitude |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "level": 2,
    "duration": 45.5,
    "distance": 25.3
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

**Traffic Levels:**
- 1: Light
- 2: Moderate
- 3: Heavy
- 4: Congested

---

## Model Management

### GET /model/info

Get information about the trained model.

**Request:**
```http
GET /api/model/info HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "success": true,
  "model": {
    "model_type": "Random Forest",
    "delay_estimators": 100,
    "probability_estimators": 100,
    "trained": true,
    "training_date": "2026-03-11T10:00:00"
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

---

### POST /model/train

Retrain the model with new data.

**Request:**
```http
POST /api/model/train HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "X_train": [[150, 2, 1, 30, 0, 9, 0, 0], ...],
  "y_train_delay": [45.5, 30.2, ...],
  "y_train_probability": [35.2, 28.1, ...]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Model trained successfully",
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

---

## System Information

### GET /statistics

Get system statistics.

**Request:**
```http
GET /api/statistics HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "total_predictions": 50000,
    "accuracy_rate": 98.5,
    "avg_delay_reduction": 25,
    "active_users": 1250,
    "vehicles_tracked": 5000,
    "uptime_hours": 8760,
    "avg_response_time_ms": 245
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

---

### GET /monitor

Get system health monitoring data.

**Request:**
```http
GET /api/monitor HTTP/1.1
Host: localhost:5000
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "healthy",
      "uptime_seconds": 3600,
      "memory_usage_mb": 150,
      "cpu_usage_percent": 25
    },
    "api": {
      "requests_processed": 1500,
      "errors": 5,
      "avg_response_time_ms": 245
    },
    "model": {
      "status": "loaded",
      "last_training": "2026-03-11T10:00:00",
      "accuracy": 98.5
    }
  },
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error description",
  "timestamp": "2026-03-11T10:30:45.123456"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful prediction |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Invalid endpoint |
| 500 | Server Error | Internal server error |

### Common Errors

**Missing Required Field:**
```json
{
  "error": "Missing required field: vehicleType"
}
```

**Invalid Value Range:**
```json
{
  "error": "Invalid distance (must be 1-5000 km)"
}
```

**API Not Ready:**
```json
{
  "error": "Model not loaded. Please retrain."
}
```

---

## Rate Limiting (Future)

API will implement rate limiting:
- **Limit**: 100 requests per hour
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

---

## CORS Headers

All endpoints support CORS:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Examples

### JavaScript/Fetch

```javascript
const prediction = await fetch('http://localhost:5000/api/predict', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    vehicleType: 'truck',
    distance: 150,
    trafficLevel: 2,
    weatherCondition: 1,
    warehouseDelay: 30,
    departureTime: '09:00'
  })
}).then(r => r.json());
```

### Python/Requests

```python
import requests

response = requests.post(
  'http://localhost:5000/api/predict',
  json={
    'vehicleType': 'truck',
    'distance': 150,
    'trafficLevel': 2,
    'weatherCondition': 1,
    'warehouseDelay': 30,
    'departureTime': '09:00'
  }
)
result = response.json()
```

### cURL

```bash
curl -X POST http://localhost:5000/api/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "vehicleType": "truck",
    "distance": 150,
    "trafficLevel": 2,
    "weatherCondition": 1,
    "warehouseDelay": 30,
    "departureTime": "09:00"
  }'
```

---

**Last Updated**: March 2026  
**API Version**: 1.0.0
