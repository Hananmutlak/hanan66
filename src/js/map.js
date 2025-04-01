/**
 * @file map.js
 * @description This file contains the implementation of an interactive map with integrated weather, air quality, and news data.
 * It uses Leaflet.js for map rendering and integrates external APIs for additional data.
 * @requires leaflet
 * @requires leaflet/dist/leaflet.css
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// استيراد المفاتيح من ملف التهيئة
import { config } from './config.js';

/**
 * Global variable to store the Leaflet map instance.
 * @type {L.Map}
 */
let map;

/**
 * Global variable to store the currently selected country.
 * @type {string}
 */
let selectedCountry = '';

/**
 * API key for OpenWeatherMap service.
 * @constant {string}
 */
const WEATHER_API_KEY = config.WEATHER_API_KEY;

/**
 * API key for AirVisual service.
 * @constant {string}
 */
const AIRVISUAL_API_KEY = config.AIRVISUAL_API_KEY;

/**
 * Custom event triggered when a country is selected on the map.
 * @event countrySelected
 * @type {CustomEvent}
 * @property {Object} detail - Event details.
 * @property {string} detail.country - The name of the selected country.
 */
const countrySelectedEvent = new CustomEvent('countrySelected', {
  detail: { country: '' },
  bubbles: true
});

/**
 * Initializes the map and related functionalities.
 * This function checks if the DOM is fully loaded before initializing the map.
 */
export function initMap() {
  /**
   * Checks if the DOM is fully loaded and initializes the map accordingly.
   */
  function checkDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

  /**
   * Initializes the map, sets up markers, and creates info containers.
   */
  function initialize() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) throw new Error('Map container not found');
    fixLeafletIcons();
    map = initBaseMap(mapContainer);
    loadCovidData(map).catch(handleDataError);
    setupSearch(map);
    createInfoContainers();
  }

  /**
   * Creates additional containers for weather, air quality, and news information.
   */
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

    // Create news container
    const newsSection = document.createElement('section');
    newsSection.id = 'country-news';
    newsSection.innerHTML = `
      <h3 id="newsHeading">News</h3>
      <div id="newsContainer">
        <p>Select a country on the map to view related news</p>
      </div>
    `;
    mapSection.appendChild(newsSection);
  }

  /**
   * Fixes Leaflet's default icon paths to ensure proper display.
   */
  function fixLeafletIcons() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
  }

  /**
   * Initializes the base map using Leaflet.
   * @param {HTMLElement} container - The DOM element to attach the map to.
   * @returns {L.Map} The initialized Leaflet map instance.
   */
  function initBaseMap(container) {
    const map = L.map(container).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
  }

  /**
   * Loads COVID-19 data and creates markers for each country.
   * @param {L.Map} map - The Leaflet map instance.
   */
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

  /**
   * Creates a marker for a specific country on the map.
   * @param {L.Map} map - The Leaflet map instance.
   * @param {Object} country - The country data object containing latitude, longitude, and statistics.
   */
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
      fetchWeatherForCountry(selectedCountry);
      fetchAirQualityForCountry(selectedCountry);
    });
  }

  /**
   * Fetches and displays weather data for the selected country.
   * @param {string} country - The name of the selected country.
   */
  async function fetchWeatherForCountry(country) {
    const container = document.getElementById('weatherContainer');
    if (!container) return;
    showLoadingMessage(container, `Loading weather for ${country}...`);
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(country)}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        throw new Error('Country location not found');
      }
      const { lat, lon } = geoData[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      displayWeather(weatherData, country);
    } catch (error) {
      showErrorMessage(container, `Error fetching weather: ${error.message}`);
    }
  }

  /**
   * Fetches and displays air quality data for the selected country.
   * @param {string} country - The name of the selected country.
   */
  async function fetchAirQualityForCountry(country) {
    const container = document.getElementById('airContainer');
    if (!container) return;
    showLoadingMessage(container, `Loading air quality for ${country}...`);
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(country)}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        throw new Error('Country location not found');
      }
      const { lat, lon } = geoData[0];
      const airUrl = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${AIRVISUAL_API_KEY}`;
      const airResponse = await fetch(airUrl);
      const airData = await airResponse.json();
      displayAirQuality(airData);
    } catch (error) {
      showErrorMessage(container, `Error fetching air quality: ${error.message}`);
    }
  }

  /**
   * Displays weather data in the designated container.
   * @param {Object} data - The weather data object.
   * @param {string} country - The name of the selected country.
   */
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

  /**
   * Displays air quality data in the designated container.
   * @param {Object} data - The air quality data object.
   */
  function displayAirQuality(data) {
    const container = document.getElementById('airContainer');
    if (!container) return;
    const aqi = data.data?.current?.pollution?.aqius;
    const mainPollutant = data.data?.current?.pollution?.mainus;
    const temperature = data.data?.current?.weather?.tp;
    const humidity = data.data?.current?.weather?.hu;
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

  /**
   * Returns the CSS class name based on the AQI value.
   * @param {number} aqi - The Air Quality Index value.
   * @returns {string} The CSS class name.
   */
  function getAqiClass(aqi) {
    if (!aqi) return '';
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
  }

  /**
   * Displays a loading message in the specified container.
   * @param {HTMLElement} container - The target container.
   * @param {string} msg - The loading message.
   */
  function showLoadingMessage(container, msg) {
    container.innerHTML = `<div class="loading-spinner"><p>${msg}</p></div>`;
  }

  /**
   * Displays an error message in the specified container.
   * @param {HTMLElement} container - The target container.
   * @param {string} msg - The error message.
   */
  function showErrorMessage(container, msg) {
    container.innerHTML = `<p class="error">${msg}</p>`;
  }

  /**
   * Handles errors that occur during data loading.
   * @param {Error} error - The error object.
   */
  function handleDataError(error) {
    console.error('Data loading error:', error);
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
    }
  }

  /**
   * Sets up the search functionality for the map.
   * @param {L.Map} map - The Leaflet map instance.
   */
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

  /**
   * Performs a search for a country on the map.
   * @param {L.Map} map - The Leaflet map instance.
   * @param {HTMLInputElement} input - The search input element.
   */
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

/**
 * Retrieves the currently selected country.
 * @returns {string} The name of the selected country.
 */
export function getSelectedCountry() {
  return selectedCountry;
}