/**
 * @module MapIntegration
 * @description Enhanced Leaflet map implementation with news integration
 * @requires leaflet
 * @requires leaflet/dist/leaflet.css
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

/**
 * Main function to initialize the COVID-19 map visualization
 * @alias module:MapIntegration.initMap
 * @example
 * // Initialize the map
 * initMap();
 */
export function initMap() {
  /**
   * @private
   * @description Checks DOM readiness and initializes map components
   */
  function checkDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

  /**
   * @private
   * @description Core initialization function
   * @throws {Error} When map container is not found
   */
  function initialize() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) throw new Error('Map container not found');

    fixLeafletIcons();
    map = initBaseMap(mapContainer);
    loadCovidData(map).catch(handleDataError);
    setupSearch(map);
    
    // Create news container if it doesn't exist
    createNewsContainer();
  }

  /**
   * @private
   * @description Creates a container for country-specific news if it doesn't exist
   */
  function createNewsContainer() {
    // Check if we're on the map page
    if (document.getElementById('map')) {
      // Check if the container already exists
      if (!document.getElementById('countryNewsContainer')) {
        const mapSection = document.getElementById('map');
        
        // Create heading
        const newsHeading = document.createElement('h3');
        newsHeading.id = 'countryNewsHeading';
        newsHeading.textContent = 'Disease News';
        newsHeading.style.marginTop = '20px';
        
        // Create container
        const newsContainer = document.createElement('div');
        newsContainer.id = 'countryNewsContainer';
        newsContainer.className = 'news-container';
        newsContainer.innerHTML = '<p>Select a country on the map to see related disease news</p>';
        
        // Append to the map section
        mapSection.appendChild(newsHeading);
        mapSection.appendChild(newsContainer);
      }
    }
  }

  /**
   * @private
   * @description Fixes Leaflet's default icon paths
   */
  function fixLeafletIcons() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    }) ;
  }

  /**
   * @private
   * @description Initializes base map configuration
   * @param {HTMLElement} container - The DOM element to contain the map
   * @returns {L.Map} Configured Leaflet map instance
   */
  function initBaseMap(container) {
    const map = L.map(container).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }) .addTo(map);
    return map;
  }

  /**
   * @private
   * @description Fetches and displays COVID-19 data
   * @param {L.Map} map - Leaflet map instance
   * @returns {Promise<void>}
   * @throws {Error} When data fetching fails
   */
  async function loadCovidData(map) {
    try {
      const response = await fetch('https://disease.sh/v3/covid-19/countries') ;
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      data.forEach(country => createCountryMarker(map, country));
    } catch (error) {
      throw new Error(`Failed to load COVID data: ${error.message}`);
    }
  }

  /**
   * @private
   * @description Creates a marker for a country with COVID data
   * @param {L.Map} map - Leaflet map instance
   * @param {Object} country - Country data object
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
    
    // Add click event to marker
    marker.on('click', () => {
      // Update selected country
      selectedCountry = country.country;
      
      // Update news heading
      const newsHeading = document.getElementById('countryNewsHeading');
      if (newsHeading) {
        newsHeading.textContent = `Disease News for ${selectedCountry}`;
      }
      
      // Dispatch custom event with country name
      countrySelectedEvent.detail.country = selectedCountry;
      document.dispatchEvent(new CustomEvent('countrySelected', {
        detail: { country: selectedCountry },
        bubbles: true
      }));
      
      // If we're on the map page, fetch news directly
      if (document.getElementById('countryNewsContainer')) {
        fetchCountryNews(selectedCountry);
      }
    });
  }

  /**
   * @private
   * @description Fetches news related to diseases for a specific country
   * @param {string} country - Country name to search for
   */
  async function fetchCountryNews(country) {
    const newsContainer = document.getElementById('countryNewsContainer');
    if (!newsContainer) return;
    
    // Show loading message
    newsContainer.innerHTML = '<p>Loading news for ' + country + '...</p>';
    
    try {
      // Use the NewsAPI to fetch news related to diseases in the selected country
      const apiKey = '8cf220f2e3f548b78aa38afc2f12b039';
      const query = `(disease OR pandemic OR outbreak OR virus OR infection) AND ${country}`;
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query) }&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      displayCountryNews(data.articles, newsContainer);
      
    } catch (error) {
      newsContainer.innerHTML = `<p class="error">Error fetching news: ${error.message}</p>`;
    }
  }

  /**
   * @private
   * @description Displays news articles in the provided container
   * @param {Array} articles - Array of news articles
   * @param {HTMLElement} container - Container element to display news
   */
  function displayCountryNews(articles, container) {
    // If no articles are found, display a message
    if (!articles || articles.length === 0) {
      container.innerHTML = `<p>No news articles found for ${selectedCountry}.</p>`;
      return;
    }

    // Display up to 4 articles in the container
    container.innerHTML = articles
      .slice(0, 4) // Display only the first 4 articles
      .map(article => `
        <div class="news-article">
          <img src="${article.urlToImage || 'https://via.placeholder.com/300?text=No+Image'}" alt="News Image">
          <div class="news-content">
            <h3><a href="${article.url}" target="_blank">${article.title || "No title available"}</a></h3>
            <p>${article.description ? article.description.substring(0, 80)  + '...' : "No description available."}</p>
            <p><strong>Source:</strong> ${article.source.name || "Unknown"} | <strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString()}</p>
          </div>
        </div>
      `).join('');
  }

  /**
   * @private
   * @description Handles data loading errors
   * @param {Error} error - The error object
   */
  function handleDataError(error) {
    console.error('Data loading error:', error);
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
    }
  }

  /**
   * @private
   * @description Sets up search functionality
   * @param {L.Map} map - Leaflet map instance
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
   * @private
   * @description Executes map search
   * @param {L.Map} map - Leaflet map instance
   * @param {HTMLInputElement} input - Search input element
   */
  function performSearch(map, input) {
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    
    // Find markers that match the search query
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
      // Open popup of first match
      markers[0].openPopup();
      // Center map on first match
      map.setView(markers[0].getLatLng(), 5);
    } else {
      alert('No countries found matching your search.');
    }
  }

  // Start the initialization
  checkDOM();
}

/**
 * Get the currently selected country
 * @returns {string} The name of the selected country
 */
export function getSelectedCountry() {
  return selectedCountry;
}
