// ============================================
// MAIN JAVASCRIPT - General utilities
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupNavigation();
});

// ============================================
// ANIMATIONS
// ============================================

function initializeAnimations() {
    // Observe elements for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInDown 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.problem-card, .feature-card, .result-card').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });

    // Update active nav based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// ============================================
// STORAGE & UTILITIES
// ============================================

const StorageManager = {
    // Save prediction data
    savePrediction: function(data) {
        localStorage.setItem('lastPrediction', JSON.stringify(data));
    },

    // Get last prediction
    getLastPrediction: function() {
        const data = localStorage.getItem('lastPrediction');
        return data ? JSON.parse(data) : null;
    },

    // Clear prediction
    clearPrediction: function() {
        localStorage.removeItem('lastPrediction');
    },

    // Save tracking data
    saveTracking: function(data) {
        localStorage.setItem('deliveryTracking', JSON.stringify(data));
    },

    // Get tracking data
    getTracking: function() {
        const data = localStorage.getItem('deliveryTracking');
        return data ? JSON.parse(data) : null;
    }
};

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        const messageEl = toast.querySelector('#toastMessage');
        messageEl.textContent = message;
        toast.style.display = 'flex';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}

// ============================================
// FORM UTILITIES
// ============================================

function collectFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    return data;
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });

    return isValid;
}

// ============================================
// API COMMUNICATION
// ============================================

const API = {
    baseURL: 'http://localhost:5000/api',

    // Make prediction
    predictDelay: async function(data) {
        try {
            const response = await fetch(`${this.baseURL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    },

    // Get weather data
    getWeather: async function(lat, lon) {
        try {
            const response = await fetch(`${this.baseURL}/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Weather API error');
            return await response.json();
        } catch (error) {
            console.error('Weather error:', error);
            return null;
        }
    },

    // Get traffic data
    getTraffic: async function(lat, lon) {
        try {
            const response = await fetch(`${this.baseURL}/traffic?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Traffic API error');
            return await response.json();
        } catch (error) {
            console.error('Traffic error:', error);
            return null;
        }
    }
};

// ============================================
// FORMATTING UTILITIES
// ============================================

const Formatter = {
    // Format time from input (HH:MM)
    formatTime: function(timeString) {
        if (!timeString) return '--:-- --';
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h % 12 || 12;
        return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
    },

    // Format date
    formatDate: function(date) {
        if (typeof date === 'string') date = new Date(date);
        const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    // Format duration
    formatDuration: function(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}min`;
        }
    },

    // Get vehicle icon
    getVehicleEmoji: function(vehicleType) {
        const emojis = {
            'truck': '🚚',
            'car': '🚗',
            'bike': '🏍️',
            'ship': '🚢',
            'airplane': '✈️'
        };
        return emojis[vehicleType] || '📦';
    },

    // Get vehicle name
    getVehicleName: function(vehicleType) {
        const names = {
            'truck': 'Truck (Heavy Cargo)',
            'car': 'Car (Regular Delivery)',
            'bike': 'Motorcycle (Quick Delivery)',
            'ship': 'Ship (Maritime)',
            'airplane': 'Airplane (Air Freight)'
        };
        return names[vehicleType] || vehicleType;
    },

    // Get traffic level label
    getTrafficLabel: function(level) {
        const labels = {
            '1': 'Light Traffic',
            '2': 'Moderate Traffic',
            '3': 'Heavy Traffic',
            '4': 'Congested'
        };
        return labels[level] || 'Unknown';
    },

    // Get weather label
    getWeatherLabel: function(weather) {
        const labels = {
            '1': 'Clear/Sunny',
            '2': 'Cloudy',
            '3': 'Rainy',
            '4': 'Snowy',
            '5': 'Stormy'
        };
        return labels[weather] || 'Unknown';
    }
};

// ============================================
// DELAY PREDICTION HELPER
// ============================================

const DelayPredictor = {
    // Calculate base delivery time
    calculateBaseTime: function(distance, vehicleType) {
        const speeds = {
            'airplane': 500,
            'ship': 30,
            'truck': 80,
            'car': 100,
            'bike': 40
        };
        const speed = speeds[vehicleType] || 80;
        return Math.round((distance / speed) * 60); // in minutes
    },

    // Calculate delay probability
    calculateDelayProbability: function(traffic, weather, warehouseDelay) {
        let probability = 0;
        
        // Traffic impact (40%)
        probability += (traffic / 4) * 0.4 * 100;
        
        // Weather impact (35%)
        if (weather > 2) {
            probability += ((weather - 2) / 3) * 0.35 * 100;
        }
        
        // Warehouse delay impact (25%)
        probability += Math.min(warehouseDelay / 120, 1) * 0.25 * 100;
        
        return Math.round(Math.min(probability, 100));
    },

    // Determine status
    getDelayStatus: function(probability) {
        if (probability < 30) return { status: 'on-time', label: 'ON TIME', color: '#10b981' };
        if (probability < 60) return { status: 'warning', label: 'POSSIBLE DELAY', color: '#f59e0b' };
        return { status: 'danger', label: 'HIGH DELAY RISK', color: '#ef4444' };
    },

    // Get factor impacts
    getFactorImpacts: function(traffic, weather, warehouseDelay, distance, isPeakHours) {
        const totalImpact = traffic + (weather * 0.8) + (warehouseDelay / 30) + (distance / 50);
        
        return {
            traffic: Math.round((traffic / totalImpact) * 100),
            weather: Math.round((weather * 0.8 / totalImpact) * 100),
            warehouse: Math.round(((warehouseDelay / 30) / totalImpact) * 100),
            distance: Math.round(((distance / 50) / totalImpact) * 100)
        };
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// PAGE READY INDICATOR
// ============================================

console.log('Main.js loaded successfully');
