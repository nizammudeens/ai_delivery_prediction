// ============================================
// MAP PAGE - Live Tracking
// ============================================

let map;
let currentMarker;
let routePath;
let trackingInterval;
let isTracking = true;

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadTrackingData();
    setupTrackingControls();
    startLiveTracking();
});

// ============================================
// MAP INITIALIZATION
// ============================================

function initializeMap() {
    // Initialize Leaflet map
    map = L.map('mapElement').setView([37.7749, -122.4194], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add markers for origin and destination
    const originMarker = L.marker([37.7749, -122.4194], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    }).addTo(map).bindPopup('Warehouse A - Origin');

    const destinationMarker = L.marker([37.8044, -122.2712], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    }).addTo(map).bindPopup('Customer Address - Destination');

    // Draw route
    drawRoute([
        [37.7749, -122.4194],
        [37.7789, -122.4190],
        [37.7844, -122.2700],
        [37.8044, -122.2712]
    ]);

    // Add current position marker
    currentMarker = L.marker([37.7800, -122.4000], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    }).addTo(map).bindPopup('Current Vehicle Position');

    map.fitBounds([
        [37.7749, -122.4194],
        [37.8044, -122.2712]
    ], { padding: [50, 50] });
}

// ============================================
// DRAW ROUTE
// ============================================

function drawRoute(waypoints) {
    if (routePath) {
        map.removeLayer(routePath);
    }

    routePath = L.polyline(waypoints, {
        color: '#2563eb',
        weight: 3,
        opacity: 0.7,
        lineCap: 'round'
    }).addTo(map);
}

// ============================================
// TRACKING DATA
// ============================================

function loadTrackingData() {
    const tracking = StorageManager.getTracking() || generateMockTrackingData();
    
    // Update tracking panel
    updateTrackingPanel(tracking);
}

function generateMockTrackingData() {
    return {
        orderId: 'DEL-2026-001',
        status: 'on-time',
        distance: 45,
        speed: 55,
        eta: '02:30 PM',
        delayRisk: 'Low',
        latitude: 37.7800,
        longitude: -122.4000,
        origin: { lat: 37.7749, lon: -122.4194, name: 'Warehouse A' },
        destination: { lat: 37.8044, lon: -122.2712, name: 'Customer Address' }
    };
}

function updateTrackingPanel(tracking) {
    document.getElementById('trackDistance').textContent = tracking.distance + ' km';
    document.getElementById('trackSpeed').textContent = tracking.speed + ' km/h';
    document.getElementById('trackETA').textContent = tracking.eta;
    document.getElementById('trackDelayRisk').textContent = tracking.delayRisk;
    
    const riskColors = {
        'Low': 'on-time',
        'Medium': 'warning',
        'High': 'danger'
    };
    
    const delayAlert = document.getElementById('delayAlert');
    if (delayAlert) {
        const predictionBox = delayAlert.querySelector('.prediction-box');
        predictionBox.className = `prediction-box ${riskColors[tracking.delayRisk] || 'on-time'}`;
    }
    
    const delayMessage = {
        'Low': '✅ Expected delivery on time',
        'Medium': '⚠️ Possible delay - proceed with caution',
        'High': '🚨 High delay risk - customer notification recommended'
    };
    
    document.getElementById('trackDelayMessage').textContent = 
        delayMessage[tracking.delayRisk] || 'Analyzing...';

    // Update current marker position
    if (currentMarker && tracking.latitude && tracking.longitude) {
        currentMarker.setLatLng([tracking.latitude, tracking.longitude]);
    }
}

// ============================================
// LIVE TRACKING
// ============================================

function startLiveTracking() {
    trackingInterval = setInterval(() => {
        if (!isTracking) return;

        // Simulate vehicle movement
        const tracking = StorageManager.getTracking() || generateMockTrackingData();
        
        // Update position slightly
        const latVariation = (Math.random() - 0.5) * 0.002;
        const lonVariation = (Math.random() - 0.5) * 0.002;
        
        tracking.latitude += latVariation;
        tracking.longitude += lonVariation;
        
        // Update distance
        tracking.distance = Math.max(0, tracking.distance - 0.5);
        
        // Update speed (random between 40-80)
        tracking.speed = Math.round(40 + Math.random() * 40);
        
        // Update completion percentage
        const completionPercent = Math.round((40 - tracking.distance) / 40 * 100);
        
        // Add live update
        addLiveUpdate(`Delivery ${completionPercent}% completed - ${tracking.speed} km/h`);
        
        // Update panel
        updateTrackingPanel(tracking);
        
        // Save tracking data
        StorageManager.saveTracking(tracking);
    }, 3000);
}

function stopLiveTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}

// ============================================
// LIVE UPDATES
// ============================================

function addLiveUpdate(message) {
    const updatesList = document.querySelector('.updates-list');
    if (!updatesList) return;

    const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const updateItem = document.createElement('div');
    updateItem.className = 'update-item';
    updateItem.innerHTML = `
        <span class="update-time">${time}</span>
        <span>${message}</span>
    `;

    updatesList.insertBefore(updateItem, updatesList.firstChild);

    // Keep only last 10 updates
    const items = updatesList.querySelectorAll('.update-item');
    for (let i = items.length - 1; i >= 10; i--) {
        items[i].remove();
    }
}

// ============================================
// TRACKING CONTROLS
// ============================================

function setupTrackingControls() {
    const pauseBtn = document.querySelector('[onclick="toggleTracking()"]');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', toggleTracking);
    }
}

function toggleTracking() {
    isTracking = !isTracking;
    
    const btn = document.querySelector('[onclick="toggleTracking()"]');
    if (btn) {
        if (isTracking) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause Tracking';
            startLiveTracking();
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Resume Tracking';
            stopLiveTracking();
        }
    }
}

function togglePanel() {
    const panel = document.querySelector('.tracking-panel');
    if (panel) {
        panel.style.transform = panel.style.transform === 'translateX(350px)' 
            ? 'translateX(0)' 
            : 'translateX(350px)';
    }
}

// ============================================
// GEOLOCATION (Optional)
// ============================================

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                
                if (currentMarker) {
                    currentMarker.setLatLng([latitude, longitude]);
                    map.setView([latitude, longitude], 14);
                }

                // Update tracking data
                const tracking = StorageManager.getTracking() || generateMockTrackingData();
                tracking.latitude = latitude;
                tracking.longitude = longitude;
                StorageManager.saveTracking(tracking);
            },
            error => console.error('Geolocation error:', error)
        );
    }
}

// ============================================
// ROUTE OPTIMIZATION
// ============================================

function optimizeRoute() {
    const tracking = StorageManager.getTracking() || generateMockTrackingData();
    
    // Simulate route optimization
    showNotification('Route optimized for faster delivery!', 'success');
    
    // Update distance and ETA
    tracking.distance = Math.round(tracking.distance * 0.9);
    tracking.eta = calculateNewETA(tracking.distance);
    
    StorageManager.saveTracking(tracking);
    updateTrackingPanel(tracking);
    
    addLiveUpdate('🗺️ Route optimized - new ETA calculated');
}

function calculateNewETA(distance) {
    const avgSpeed = 60;
    const minutes = Math.round((distance / avgSpeed) * 60);
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return Formatter.formatTime(
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0')
    );
}

// ============================================
// NOTIFICATIONS
// ============================================

function notifyCustomer() {
    const tracking = StorageManager.getTracking() || generateMockTrackingData();
    
    const message = `Delivery update: Your package is on the way. Current distance: ${tracking.distance}km. ETA: ${tracking.eta}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Delivery Update',
            text: message
        });
    } else {
        alert('Customer Notification:\n' + message);
    }
    
    addLiveUpdate('📱 Customer notification sent');
}

// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', function() {
    stopLiveTracking();
});

console.log('Map.js loaded successfully');
