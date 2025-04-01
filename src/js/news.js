/**
 * @module NewsModule
 * @description Handles fetching and displaying health-related news with country integration
 */

// Global variables
const newsContainer = document.getElementById('newsContainer');
let currentCountry = '';

/**
 * Initializes the news module and sets up event listeners
 */
function initNewsModule() {
    // Listen for country selection events from the map
    document.addEventListener('countrySelected', handleCountrySelected);
    
    // Fetch general health news on initial load
    fetchNews();
}

/**
 * Handles the country selection event from the map
 * @param {CustomEvent} event - The country selection event
 */
function handleCountrySelected(event) {
    if (event.detail?.country) {
        currentCountry = event.detail.country;
        fetchNewsForCountry(currentCountry);
    }
}

/**
 * Fetches news specifically for the selected country
 * @param {string} country - The country to fetch news for
 */
async function fetchNewsForCountry(country) {
    if (!newsContainer) return;
    
    updateNewsHeading(`Latest Disease News for ${country}`);
    showLoadingMessage(`Loading news for ${country}...`);
    
    try {
        const apiKey = '6757b6f31a9eb5abba3c0fd90dcef209'; // استبدل بمفتاحك الفعلي
        const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&country=${getCountryCode(country)}&categories=health`;

        const response = await fetch(url);
        handleResponse(response);
    } catch (error) {
        showErrorMessage(`Error fetching news: ${error.message}`);
    }
}

/**
 * Fetches general health news
 */
async function fetchNews() {
    if (!newsContainer) return;
    
    showLoadingMessage("Loading latest health news...");
    
    try {
        const apiKey = '6757b6f31a9eb5abba3c0fd90dcef209'; // استبدل بمفتاحك الفعلي
        const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&categories=health`;
        
        const response = await fetch(url);
        handleResponse(response);
    } catch (error) {
        showErrorMessage(`Error fetching news: ${error.message}`);
    }
}

// Helper functions
function updateNewsHeading(text) {
    const newsHeading = document.querySelector('#news h2');
    if (newsHeading) newsHeading.textContent = text;
}

function showLoadingMessage(msg) {
    newsContainer.innerHTML = `<div class="loading-spinner"><p>${msg}</p></div>`;
}

function showErrorMessage(msg) {
    newsContainer.innerHTML = `<p class="error">${msg}</p>`;
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json().then(data => displayNews(data.data));
}

function getCountryCode(countryName) {
    const countryCodes = {
        'usa': 'us',
        'united states': 'us',
        'sweden': 'se',
        // أضف المزيد من الدول حسب الحاجة
    };
    return countryCodes[countryName.toLowerCase()] || 'us';
}

/**
 * Displays news articles
 * @param {Array} articles - Array of news articles
 */
function displayNews(articles) {
    if (!articles?.length) {
        newsContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }

    newsContainer.innerHTML = articles.slice(0, 12).map(article => ` 
        <article class="news-article">
            <img src="${article.image || 'https://via.placeholder.com/300?text=No+Image'}" 
                 alt="${article.title || 'News image'}">
            <div class="news-content">
                <h3><a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    ${article.title || "No title available"}
                </a></h3>
                <p>${article.description?.substring(0, 100) || "No description available"}...</p>
                <footer>
                    <span>${article.source?.name || "Unknown source"}</span>
                    <time>${new Date(article.published_at).toLocaleDateString()}</time>
                </footer>
            </div>
        </article>
    `).join('');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsModule);
} else {
    initNewsModule();
}

export { fetchNewsForCountry };
