import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (city = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather${city ? `?city=${city}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    fetchWeather(city);
  };

  if (loading) {
    return <div className="app"><div className="loading">Loading weather data...</div></div>;
  }

  if (error) {
    return <div className="app"><div className="error">Error: {error}</div></div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌤️ Weather Dashboard</h1>
        <p>Kubernetes ConfigMap & Secret Demo</p>
      </header>

      <div className="controls">
        <select value={selectedCity} onChange={handleCityChange} className="city-selector">
          <option value="">Default City</option>
          <option value="london">London</option>
          <option value="tokyo">Tokyo</option>
          <option value="newyork">New York</option>
          <option value="sydney">Sydney</option>
        </select>
        <button onClick={() => fetchWeather(selectedCity)} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <div className="weather-main">
            <div className="temperature">{weather.temperature}°C</div>
            <div className="description">{weather.description}</div>
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span className="label">Humidity:</span>
              <span className="value">{weather.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Wind Speed:</span>
              <span className="value">{weather.windSpeed} m/s</span>
            </div>
            <div className="detail-item">
              <span className="label">Pressure:</span>
              <span className="value">{weather.pressure} hPa</span>
            </div>
          </div>
          <div className="config-info">
            <small>
              Data from: {weather.source} | 
              Config: {weather.configSource || 'Default'}
            </small>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Demo for Kubernetes ConfigMaps and Secrets</p>
      </footer>
    </div>
  );
}

export default App;