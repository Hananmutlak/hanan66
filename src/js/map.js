/**
 * @module MapIntegration
 * @description Enhanced Leaflet map implementation with news, weather and air quality integration
 * @requires leaflet
 * @requires leaflet/dist/leaflet.css
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// API Keys (should be stored securely in production)
const WEATHER_API_KEY = '5185650ef9d376a4d394a0d06125bda7';
const AIRVISUAL_API_KEY = '762bc8c7-2bfd-416f-b427-8fbaab8832c5';

// Store the map instance and selected country globally
let map;
let selectedCountry = '';

/**
 * Custom event for country selection
 * @type {CustomEvent}
 */
const countrySelectedEvent = new CustomEvent('countrySelected', {
  detail: { country: '' },
  bubbles: true
});

export function initMap() {
  function checkDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

  function initialize() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) throw new Error('Map container not found');

    fixLeafletIcons();
    map = initBaseMap(mapContainer);
    loadCovidData(map).catch(handleDataError);
    setupSearch(map);
    createInfoContainers();
  }

  function createInfoContainers() {
    const mapSection = document.getElementById('map');
    if (!mapSection) return;

    // Create weather container
    const weatherSection = document.createElement('section');
    weatherSection.id = 'country-weather';
    weatherSection.innerHTML = `
      <h3 id="weatherHeading">Current Weather</h3>
      <div id="weatherContainer">
        <p>Select a country on the map to view weather information</p>
      </div>
    `;
    mapSection.appendChild(weatherSection);

    // Create air quality container
    const airQualitySection = document.createElement('section');
    airQualitySection.id = 'country-air';
    airQualitySection.innerHTML = `
      <h3 id="airHeading">Air Quality</h3>
      <div id="airContainer">
        <p>Select a country on the map to view air quality information</p>
      </div>
    `;
    mapSection.appendChild(airQualitySection);
  }

  function fixLeafletIcons() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
  }

  function initBaseMap(container) {
    const map = L.map(container).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
  }

  async function loadCovidData(map) {
    try {
      const response = await fetch('https://disease.sh/v3/covid-19/countries');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      data.forEach(country => createCountryMarker(map, country));
    } catch (error) {
      throw new Error(`Failed to load COVID data: ${error.message}`);
    }
  }

  function createCountryMarker(map, country) {
    if (!country.countryInfo?.lat || !country.countryInfo?.long) return;

    const marker = L.marker([country.countryInfo.lat, country.countryInfo.long]).addTo(map);
    marker.bindPopup(`
      <b>${country.country}</b><br>
      Cases: ${country.cases.toLocaleString()}<br>
      Deaths: ${country.deaths.toLocaleString()}<br>
      Recovered: ${country.recovered.toLocaleString()}
    `);
    
    marker.on('click', () => {
      selectedCountry = country.country;
      countrySelectedEvent.detail.country = selectedCountry;
      document.dispatchEvent(countrySelectedEvent);
      
      // Fetch weather and air quality data
      fetchWeatherForCountry(selectedCountry);
      fetchAirQualityForCountry(selectedCountry);
    });
  }

  async function fetchWeatherForCountry(country) {
    const container = document.getElementById('weatherContainer');
    if (!container) return;
    
    showLoadingMessage(container, `Loading weather for ${country}...`);
    
    try {
      // Get coordinates for the country
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(country)}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error('Country location not found');
      }
      
      const { lat, lon } = geoData[0];
      
      // Get weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      
      displayWeather(weatherData, country);
    } catch (error) {
      showErrorMessage(container, `Error fetching weather: ${error.message}`);
    }
  }

  async function fetchAirQualityForCountry(country) {
    const container = document.getElementById('airContainer');
    if (!container) return;
    
    showLoadingMessage(container, `Loading air quality for ${country}...`);
    
    try {
      // Get coordinates for the country (using OpenWeatherMap as AirVisual requires exact coordinates)
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(country)}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error('Country location not found');
      }
      
      const { lat, lon } = geoData[0];
      
      // Get air quality data from AirVisual
      const airUrl = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${AIRVISUAL_API_KEY}`;
      const airResponse = await fetch(airUrl);
      const airData = await airResponse.json();
      
      displayAirQuality(airData);
    } catch (error) {
      showErrorMessage(container, `Error fetching air quality: ${error.message}`);
    }
  }

  function displayWeather(data, country) {
    const container = document.getElementById('weatherContainer');
    if (!container) return;

    const temp = data.main?.temp;
    const description = data.weather?.[0]?.description;
    const iconCode = data.weather?.[0]?.icon;
    const humidity = data.main?.humidity;
    const windSpeed = data.wind?.speed;

    container.innerHTML = `
      <div class="weather-card">
        <h4>Weather in ${country}</h4>
        <div class="weather-main">
          ${iconCode ? `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">` : ''}
          <div class="weather-temp">${temp ? `${temp}°C` : 'N/A'}</div>
        </div>
        <div class="weather-details">
          <p>${description ? description.charAt(0).toUpperCase() + description.slice(1) : ''}</p>
          <p>Humidity: ${humidity || 'N/A'}%</p>
          <p>Wind: ${windSpeed || 'N/A'} m/s</p>
        </div>
      </div>
    `;
  }

  function displayAirQuality(data) {
    const container = document.getElementById('airContainer');
    if (!container) return;

    const aqi = data.data?.current?.pollution?.aqius;
    const mainPollutant = data.data?.current?.pollution?.mainus;
    const temperature = data.data?.current?.weather?.tp;
    const humidity = data.data?.current?.weather?.hu;

    // Get AQI level description
    let aqiLevel = '';
    if (aqi <= 50) aqiLevel = 'Good';
    else if (aqi <= 100) aqiLevel = 'Moderate';
    else if (aqi <= 150) aqiLevel = 'Unhealthy for Sensitive Groups';
    else if (aqi <= 200) aqiLevel = 'Unhealthy';
    else if (aqi <= 300) aqiLevel = 'Very Unhealthy';
    else aqiLevel = 'Hazardous';

    container.innerHTML = `
      <div class="air-card">
        <h4>Air Quality Index (AQI)</h4>
        <div class="aqi-value ${getAqiClass(aqi)}">${aqi || 'N/A'}</div>
        <div class="aqi-level">${aqiLevel}</div>
        <div class="air-details">
          ${mainPollutant ? `<p>Main pollutant: ${mainPollutant}</p>` : ''}
          ${temperature ? `<p>Temperature: ${temperature}°C</p>` : ''}
          ${humidity ? `<p>Humidity: ${humidity}%</p>` : ''}
        </div>
      </div>
    `;
  }

  function getAqiClass(aqi) {
    if (!aqi) return '';
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
  }

  function showLoadingMessage(container, msg) {
    container.innerHTML = `<div class="loading-spinner"><p>${msg}</p></div>`;
  }

  function showErrorMessage(container, msg) {
    container.innerHTML = `<p class="error">${msg}</p>`;
  }

  function handleDataError(error) {
    console.error('Data loading error:', error);
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
    }
  }

  function setupSearch(map) {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (!searchInput || !searchButton) {
      console.warn('Search elements not found');
      return;
    }

    searchButton.addEventListener('click', () => performSearch(map, searchInput));
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch(map, searchInput);
    });
  }

  function performSearch(map, input) {
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    
    const markers = [];
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        const popup = layer.getPopup();
        if (popup) {
          const content = popup.getContent();
          if (content.toLowerCase().includes(query)) {
            markers.push(layer);
          }
        }
      }
    });
    
    if (markers.length > 0) {
      markers[0].openPopup();
      map.setView(markers[0].getLatLng(), 5);
    } else {
      alert('No countries found matching your search.');
    }
  }

  checkDOM();
}

export function getSelectedCountry() {
  return selectedCountry;
}