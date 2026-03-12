// ============================================
// PREDICTION PAGE - Form Handling
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializePredictionForm();
    loadLastPredictionIfAvailable();
});

// ============================================
// FORM INITIALIZATION
// ============================================

function initializePredictionForm() {
    const form = document.getElementById('predictionForm');
    
    if (form) {
        form.addEventListener('submit', handlePrediction);
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                validateFieldInput(this);
            });
            input.addEventListener('blur', function() {
                validateFieldInput(this);
            });
        });
    }

    // Initialize example data
    setupExampleData();
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

async function handlePrediction(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm('predictionForm')) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Collect form data
    const formData = collectFormData('predictionForm');
    
    // Show loading overlay
    showLoadingOverlay();
    
    // Add loading animation
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    try {
        // Call API
        const result = await API.predictDelay(formData);
        
        // Save to storage
        const predictionData = {
            ...formData,
            result: result,
            timestamp: new Date().toISOString()
        };
        StorageManager.savePrediction(predictionData);

        // Redirect to loading page
        setTimeout(() => {
            window.location.href = 'loading.html';
        }, 500);

    } catch (error) {
        hideLoadingOverlay();
        console.error('Prediction error:', error);
        
        // Show mock result (for demo without backend)
        showMockResult(formData);
    }
}

// ============================================
// MOCK RESULT - For Demo
// ============================================

function showMockResult(formData) {
    const distance = parseInt(formData.distance) || 100;
    const traffic = parseInt(formData.trafficLevel) || 2;
    const weather = parseInt(formData.weatherCondition) || 1;
    const warehouseDelay = parseInt(formData.warehouseDelay) || 0;

    // Calculate predictions
    const baseTime = DelayPredictor.calculateBaseTime(distance, formData.vehicleType);
    const trafficDelay = (traffic * 15) + (traffic * 5);
    const weatherDelay = (weather > 2 ? (weather - 1) * 10 : 0);
    const totalDelay = trafficDelay + weatherDelay + (warehouseDelay * 0.5);

    const estimatedTime = baseTime + totalDelay;
    const delayProbability = DelayPredictor.calculateDelayProbability(traffic, weather, warehouseDelay);

    const result = {
        success: true,
        estimatedDeliveryTime: estimatedTime,
        delayProbability: delayProbability,
        predictedDelay: Math.round(totalDelay),
        baseTime: baseTime,
        factors: {
            traffic: trafficDelay,
            weather: weatherDelay,
            warehouse: warehouseDelay
        }
    };

    // Save mock result
    const predictionData = {
        ...formData,
        result: result,
        timestamp: new Date().toISOString()
    };
    StorageManager.savePrediction(predictionData);

    // Redirect to loading page
    setTimeout(() => {
        window.location.href = 'loading.html';
    }, 500);
}

// ============================================
// FORM VALIDATION
// ============================================

function validateFieldInput(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#ef4444';
        return false;
    } else {
        field.style.borderColor = '#e5e7eb';
    }

    // Specific validations
    if (field.type === 'number') {
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        
        if (min && parseInt(value) < parseInt(min)) {
            field.style.borderColor = '#ef4444';
            return false;
        }
        if (max && parseInt(value) > parseInt(max)) {
            field.style.borderColor = '#ef4444';
            return false;
        }
    }

    return true;
}

// ============================================
// LOAD LAST PREDICTION
// ============================================

function loadLastPredictionIfAvailable() {
    const lastPrediction = StorageManager.getLastPrediction();
    
    if (lastPrediction) {
        const container = document.querySelector('.prediction-section');
        if (container) {
            const quickLoadBtn = document.createElement('div');
            quickLoadBtn.className = 'quick-load-suggestion';
            quickLoadBtn.innerHTML = `
                <p>📊 We found your last prediction. Would you like to:</p>
                <button type="button" class="btn btn-secondary" onclick="loadPreviousPrediction()">
                    Load Previous
                </button>
            `;
            container.insertBefore(quickLoadBtn, container.firstChild);
        }
    }
}

function loadPreviousPrediction() {
    const lastPrediction = StorageManager.getLastPrediction();
    
    if (lastPrediction) {
        const form = document.getElementById('predictionForm');
        form.vehicleType.value = lastPrediction.vehicleType;
        form.distance.value = lastPrediction.distance;
        form.trafficLevel.value = lastPrediction.trafficLevel;
        form.weatherCondition.value = lastPrediction.weatherCondition;
        form.warehouseDelay.value = lastPrediction.warehouseDelay;
        form.departureTime.value = lastPrediction.departureTime;
    }
}

// ============================================
// EXAMPLE DATA
// ============================================

function setupExampleData() {
    const form = document.getElementById('predictionForm');
    if (!form) return;

    // Generate sample data for demo
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // Pre-fill with example
    if (!form.distance.value) {
        form.vehicleType.value = 'truck';
        form.distance.value = '150';
        form.trafficLevel.value = '2';
        form.weatherCondition.value = '1';
        form.warehouseDelay.value = '30';
        form.departureTime.value = currentTime;
    }
}

// ============================================
// CLEAR FORM
// ============================================

function clearPredictionForm() {
    const form = document.getElementById('predictionForm');
    if (form) {
        form.reset();
        setupExampleData();
        showNotification('Form cleared');
    }
}

// ============================================
// STATISTICS & INSIGHTS
// ============================================

const StatisticsHelper = {
    // Mock statistics
    getPredictionStats: function() {
        return {
            accuracyRate: 98.5,
            deliveriesAnalyzed: 50000,
            avgDelayReduction: 25,
            activeUsers: 1250
        };
    },

    // Get risk insights
    getRiskInsights: function() {
        return {
            low: {
                percentage: 65,
                label: 'Low Risk',
                description: 'Most deliveries complete on time'
            },
            medium: {
                percentage: 25,
                label: 'Medium Risk',
                description: 'Some delays expected'
            },
            high: {
                percentage: 10,
                label: 'High Risk',
                description: 'Significant delay probability'
            }
        };
    }
};

// ============================================
// FORM TOOLTIPS
// ============================================

function setupFormTooltips() {
    const labels = document.querySelectorAll('.form-group label');
    
    labels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            const field = this.nextElementSibling;
            if (field && field.tagName === 'SMALL') {
                field.style.opacity = '1';
            }
        });
    });
}

// ============================================
// RESPONSIVE FORM ADJUSTMENTS
// ============================================

function adjustFormForScreen() {
    const formGrid = document.querySelector('.form-grid');
    
    if (window.innerWidth < 768) {
        if (formGrid) {
            formGrid.style.gridTemplateColumns = '1fr';
        }
    }
}

window.addEventListener('resize', adjustFormForScreen);

console.log('Prediction.js loaded successfully');
