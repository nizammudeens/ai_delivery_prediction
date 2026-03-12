// ============================================
// RESULT PAGE - Display & Charts
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayResults();
    initializeCharts();
});

// ============================================
// LOAD AND DISPLAY RESULTS
// ============================================

function loadAndDisplayResults() {
    const prediction = StorageManager.getLastPrediction();
    
    if (!prediction) {
        window.location.href = 'prediction.html';
        return;
    }

    displayDeliveryStatus(prediction);
    displayMainResults(prediction);
    displayFactorImpacts(prediction);
    displayInputSummary(prediction);
    displayRecommendations(prediction);
}

// ============================================
// DISPLAY DELIVERY STATUS
// ============================================

function displayDeliveryStatus(prediction) {
    const formData = prediction;
    const result = prediction.result || generateMockResult(prediction);

    const statusCard = document.getElementById('statusCard');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusValue = document.getElementById('statusValue');

    const delayProb = result.delayProbability || 0;
    const status = DelayPredictor.getDelayStatus(delayProb);

    // Update status card
    statusCard.className = `result-card status-card ${status.status}`;
    statusValue.textContent = status.label;

    // Update icon color
    const statusLight = statusCard.querySelector('.status-light');
    if (statusLight) {
        statusLight.className = `status-light ${status.status}`;
    }
}

// ============================================
// DISPLAY MAIN RESULTS
// ============================================

function displayMainResults(prediction) {
    const result = prediction.result || generateMockResult(prediction);

    // Estimated Delivery Time
    const departureTime = prediction.departureTime;
    const estimatedMinutes = result.estimatedDeliveryTime || 0;
    
    const departureDate = new Date();
    const [hours, minutes] = departureTime.split(':').map(Number);
    departureDate.setHours(hours, minutes);
    
    const deliveryDate = new Date(departureDate.getTime() + estimatedMinutes * 60000);
    
    document.getElementById('estimatedTime').textContent = Formatter.formatTime(
        String(deliveryDate.getHours()).padStart(2, '0') + ':' + 
        String(deliveryDate.getMinutes()).padStart(2, '0')
    );
    document.getElementById('deliveryDate').textContent = 
        `Date: ${Formatter.formatDate(deliveryDate)}`;

    // Delay Probability
    const delayProb = Math.round(result.delayProbability || 0);
    document.getElementById('delayProbability').textContent = `${delayProb}%`;
    
    const probabilityDesc = delayProb < 30 ? 'Low risk' : delayProb < 60 ? 'Medium risk' : 'High risk';
    document.getElementById('probabilityDescription').textContent = probabilityDesc;

    // Predicted Delay Duration
    const delayDuration = Math.round(result.predictedDelay || 0);
    document.getElementById('delayDuration').textContent = Formatter.formatDuration(delayDuration);
    document.getElementById('delayNote').textContent = 
        delayDuration > 0 ? `Expected additional delay: ${delayDuration} minutes` : 'No significant delay expected';
}

// ============================================
// DISPLAY FACTOR IMPACTS
// ============================================

function displayFactorImpacts(prediction) {
    const result = prediction.result || generateMockResult(prediction);

    // Traffic impact
    const trafficImpact = result.factors?.traffic || 65;
    document.getElementById('trafficScore').style.width = trafficImpact + '%';
    document.getElementById('trafficLabel').textContent = trafficImpact + '% Impact';

    // Weather impact
    const weatherImpact = result.factors?.weather || 35;
    document.getElementById('weatherScore').style.width = weatherImpact + '%';
    document.getElementById('weatherLabel').textContent = weatherImpact + '% Impact';

    // Warehouse impact
    const warehouseImpact = result.factors?.warehouse || 45;
    document.getElementById('warehouseScore').style.width = warehouseImpact + '%';
    document.getElementById('warehouseLabel').textContent = warehouseImpact + '% Impact';

    // Distance impact
    const distanceImpact = result.factors?.distance || 25;
    document.getElementById('distanceScore').style.width = distanceImpact + '%';
    document.getElementById('distanceLabel').textContent = distanceImpact + '% Impact';
}

// ============================================
// DISPLAY INPUT SUMMARY
// ============================================

function displayInputSummary(prediction) {
    document.getElementById('detailVehicle').textContent = 
        Formatter.getVehicleName(prediction.vehicleType);
    
    document.getElementById('detailDistance').textContent = 
        prediction.distance + ' km';
    
    document.getElementById('detailTraffic').textContent = 
        Formatter.getTrafficLabel(prediction.trafficLevel);
    
    document.getElementById('detailWeather').textContent = 
        Formatter.getWeatherLabel(prediction.weatherCondition);
    
    document.getElementById('detailWarehouse').textContent = 
        prediction.warehouseDelay + ' min';
    
    document.getElementById('detailDeparture').textContent = 
        Formatter.formatTime(prediction.departureTime);
}

// ============================================
// DISPLAY RECOMMENDATIONS
// ============================================

function displayRecommendations(prediction) {
    const result = prediction.result || generateMockResult(prediction);
    const delayProb = result.delayProbability || 0;
    const traffic = parseInt(prediction.trafficLevel);
    const weather = parseInt(prediction.weatherCondition);

    const recommendations = [];

    // Traffic-based recommendations
    if (traffic >= 3) {
        recommendations.push('⚠️ High traffic detected - Consider alternative routes');
        recommendations.push('📱 Send customer a proactive update about potential delays');
    }

    // Weather-based recommendations
    if (weather >= 4) {
        recommendations.push('🌧️ Severe weather conditions - Recommend delay buffer');
        recommendations.push('🛡️ Ensure delivery vehicle is weather-protected');
    }

    // Warehouse-based recommendations
    if (parseInt(prediction.warehouseDelay) > 60) {
        recommendations.push('📦 High warehouse processing time - Optimize packaging');
        recommendations.push('⏱️ Consider pre-staging items for faster pickup');
    }

    // General recommendations
    if (delayProb < 30) {
        recommendations.push('✅ Delivery on track - Maintain current route optimization');
    } else if (delayProb < 60) {
        recommendations.push('⚡ Consider accelerated pickup to compensate for delays');
    } else {
        recommendations.push('🚨 High delay risk - Notify customer immediately');
        recommendations.push('🔄 Explore same-day rescheduling options');
    }

    // Add vehicle-specific tips
    if (prediction.vehicleType === 'truck') {
        recommendations.push('🚚 Monitor fuel consumption on long routes');
    } else if (prediction.vehicleType === 'bike') {
        recommendations.push('🏍️ Check vehicle condition before high-traffic routes');
    }

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    if (recommendationsList) {
        recommendationsList.innerHTML = recommendations.map(rec => 
            `<li><i class="fas fa-lightbulb"></i> <span>${rec}</span></li>`
        ).join('');
    }
}

// ============================================
// CHARTS INITIALIZATION
// ============================================

function initializeCharts() {
    initializeDelayChart();
    initializeFactorChart();
}

function initializeDelayChart() {
    const ctx = document.getElementById('delayChart');
    if (!ctx) return;

    const prediction = StorageManager.getLastPrediction();
    const result = prediction.result || generateMockResult(prediction);
    const delayProb = result.delayProbability || 0;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['On Time Risk', 'Delay Risk'],
            datasets: [{
                data: [100 - delayProb, delayProb],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function initializeFactorChart() {
    const ctx = document.getElementById('factorChart');
    if (!ctx) return;

    const prediction = StorageManager.getLastPrediction();
    const result = prediction.result || generateMockResult(prediction);

    const traffic = result.factors?.traffic || 65;
    const weather = result.factors?.weather || 35;
    const warehouse = result.factors?.warehouse || 45;
    const distance = result.factors?.distance || 25;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Traffic', 'Weather', 'Warehouse', 'Distance'],
            datasets: [{
                label: 'Impact Factor (%)',
                data: [traffic, weather, warehouse, distance],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        },
                        padding: 15
                    }
                }
            }
        }
    });
}

// ============================================
// GENERATE MOCK RESULT
// ============================================

function generateMockResult(prediction) {
    const distance = parseInt(prediction.distance) || 100;
    const traffic = parseInt(prediction.trafficLevel) || 2;
    const weather = parseInt(prediction.weatherCondition) || 1;
    const warehouseDelay = parseInt(prediction.warehouseDelay) || 0;

    const baseTime = DelayPredictor.calculateBaseTime(distance, prediction.vehicleType);
    const trafficDelay = (traffic * 15) + (traffic * 5);
    const weatherDelay = (weather > 2 ? (weather - 1) * 10 : 0);
    const totalDelay = trafficDelay + weatherDelay + (warehouseDelay * 0.5);

    const estimatedTime = baseTime + totalDelay;
    const delayProbability = DelayPredictor.calculateDelayProbability(traffic, weather, warehouseDelay);

    return {
        success: true,
        estimatedDeliveryTime: estimatedTime,
        delayProbability: delayProbability,
        predictedDelay: Math.round(totalDelay),
        baseTime: baseTime,
        factors: {
            traffic: Math.round((trafficDelay / (trafficDelay + weatherDelay + warehouseDelay + 20)) * 100) || 65,
            weather: Math.round((weatherDelay / (trafficDelay + weatherDelay + warehouseDelay + 20)) * 100) || 35,
            warehouse: Math.round(((warehouseDelay * 0.5) / (trafficDelay + weatherDelay + warehouseDelay + 20)) * 100) || 45,
            distance: Math.round((20 / (trafficDelay + weatherDelay + warehouseDelay + 20)) * 100) || 25
        }
    };
}

// ============================================
// PRINT FUNCTIONALITY
// ============================================

function printResults() {
    window.print();
}

// ============================================
// SHARE RESULTS
// ============================================

function shareResults() {
    const prediction = StorageManager.getLastPrediction();
    const result = prediction.result || generateMockResult(prediction);
    
    const shareText = `Delivery Prediction Report:
Vehicle: ${Formatter.getVehicleName(prediction.vehicleType)}
Distance: ${prediction.distance}km
Delay Probability: ${result.delayProbability}%
Predicted Delay: ${Formatter.formatDuration(result.predictedDelay)}
Status: ${DelayPredictor.getDelayStatus(result.delayProbability).label}`;

    if (navigator.share) {
        navigator.share({
            title: 'Delivery Prediction Results',
            text: shareText
        });
    } else {
        alert('Share results:\n' + shareText);
    }
}

console.log('Result.js loaded successfully');
