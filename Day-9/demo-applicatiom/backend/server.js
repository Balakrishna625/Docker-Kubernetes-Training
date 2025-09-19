const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration from environment variables (ConfigMap)
const DEFAULT_CITY = process.env.DEFAULT_CITY || 'London';
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://api.openweathermap.org/data/2.5/weather';
const CITIES_CONFIG = process.env.CITIES_CONFIG || JSON.stringify({
  london: 'London,UK',
  tokyo: 'Tokyo,JP',
  newyork: 'New York,US',
  sydney: 'Sydney,AU'
});

// Secrets from environment variables (Secret)
const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Parse cities configuration
let citiesConfig;
try {
  citiesConfig = JSON.parse(CITIES_CONFIG);
} catch (error) {
  console.error('Error parsing CITIES_CONFIG:', error);
  citiesConfig = { default: DEFAULT_CITY };
}

// Mock weather data for demo purposes
const getMockWeatherData = (cityName) => {
  const mockData = {
    city: cityName,
    temperature: Math.floor(Math.random() * 30) + 5,
    description: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 1,
    pressure: Math.floor(Math.random() * 100) + 1000,
    source: 'Mock API',
    configSource: 'ConfigMap'
  };
  return mockData;
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      defaultCity: DEFAULT_CITY,
      apiEndpoint: API_ENDPOINT,
      hasApiKey: !!API_KEY,
      citiesCount: Object.keys(citiesConfig).length
    }
  });
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const cityKey = req.query.city || 'default';
    const cityName = citiesConfig[cityKey] || citiesConfig.default || DEFAULT_CITY;

    console.log(`Fetching weather for: ${cityName} (key: ${cityKey})`);

    // For demo purposes, we'll use mock data
    // In a real scenario, you would call the actual weather API
    if (API_KEY === 'demo-key') {
      const mockData = getMockWeatherData(cityName);
      res.json(mockData);
      return;
    }

    // Real API call (if you have a valid API key)
    try {
      const response = await axios.get(API_ENDPOINT, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const weatherData = {
        city: response.data.name,
        temperature: Math.round(response.data.main.temp),
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        pressure: response.data.main.pressure,
        source: 'OpenWeatherMap API',
        configSource: 'ConfigMap'
      };

      res.json(weatherData);
    } catch (apiError) {
      console.error('Weather API error:', apiError.message);
      // Fallback to mock data
      const mockData = getMockWeatherData(cityName);
      res.json({
        ...mockData,
        source: 'Mock API (Fallback)',
        note: 'Using mock data due to API error'
      });
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// Admin endpoint (protected by secret)
app.get('/api/admin/config', (req, res) => {
  const providedPassword = req.headers['x-admin-password'];
  
  if (providedPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid admin password'
    });
  }

  res.json({
    message: 'Admin access granted',
    configuration: {
      defaultCity: DEFAULT_CITY,
      apiEndpoint: API_ENDPOINT,
      cities: citiesConfig,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: PORT
      }
    },
    secrets: {
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      hasAdminPassword: !!ADMIN_PASSWORD
    }
  });
});

// Cities list endpoint
app.get('/api/cities', (req, res) => {
  res.json({
    cities: citiesConfig,
    defaultCity: DEFAULT_CITY
  });
});

// Demo endpoint to show ConfigMap values
app.get('/api/demo/config', (req, res) => {
  res.json({
    message: 'Configuration from Kubernetes ConfigMap',
    configMap: {
      DEFAULT_CITY: DEFAULT_CITY,
      API_ENDPOINT: API_ENDPOINT,
      CITIES_CONFIG: citiesConfig
    },
    secrets: {
      hasApiKey: !!API_KEY,
      hasAdminPassword: !!ADMIN_PASSWORD
    },
    source: 'Environment Variables (ConfigMap & Secret)'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🌤️ Weather API server running on port ${PORT}`);
  console.log(`📍 Default city: ${DEFAULT_CITY}`);
  console.log(`🔧 API endpoint: ${API_ENDPOINT}`);
  console.log(`🏙️ Available cities:`, Object.keys(citiesConfig));
  console.log(`🔑 API key configured: ${!!API_KEY}`);
  console.log(`🔐 Admin password configured: ${!!ADMIN_PASSWORD}`);
});