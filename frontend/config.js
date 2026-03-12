/**
 * Frontend Configuration
 * Handles environment-specific settings
 */

const CONFIG = {
    // API Configuration
    API: {
        // Detect API URL based on environment
        getBaseURL: function() {
            // Local development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // If running on port 8000, connect to backend on 5000
                if (window.location.port === '8000') {
                    return `http://${window.location.hostname}:5000/api`;
                }
                // Otherwise use relative path
                return '/api';
            }
            
            // Production (same domain)
            return '/api';
        },
        
        // Get full API URL for a specific endpoint
        getEndpoint: function(path) {
            return this.getBaseURL() + path;
        },
        
        // Make API request with error handling
        fetch: async function(endpoint, options = {}) {
            const url = this.getEndpoint(endpoint);
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            try {
                const response = await fetch(url, finalOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`API Error (${endpoint}):`, error);
                throw error;
            }
        }
    },
    
    // Application settings
    APP: {
        name: 'AI Delivery Delay Prediction System',
        version: '1.0.0',
        environment: window.location.hostname === 'localhost' ? 'development' : 'production'
    },
    
    // Logging
    DEBUG: window.location.hostname === 'localhost'
};

// Log configuration on load
console.log(`[${CONFIG.APP.name}] Running in ${CONFIG.APP.environment} mode`);
console.log(`API Base URL: ${CONFIG.API.getBaseURL()}`);
