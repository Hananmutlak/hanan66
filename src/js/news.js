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
    if (event.detail && event.detail.country) {
        currentCountry = event.detail.country;
        // Update news with the selected country
        fetchNewsForCountry(currentCountry);
    }
}

/**
 * Fetches news specifically for the selected country
 * @param {string} country - The country to fetch news for
 */
async function fetchNewsForCountry(country) {
    if (!newsContainer) return;
    
    // Update heading if it exists
    const newsHeading = document.querySelector('#news h2');
    if (newsHeading) {
        newsHeading.textContent = `Latest Disease News for ${country}`;
    }
    
    // Display loading message
    newsContainer.innerHTML = `<p>Loading news for ${country}...</p>`;
    
    try {
        const apiKey = '8cf220f2e3f548b78aa38afc2f12b039';
        const query = `(disease OR pandemic OR outbreak OR virus OR infection) AND ${country}`;
        const url = `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        newsContainer.innerHTML = `<p class="error">Error fetching news: ${error.message}</p>`;
    }
}

/**
 * Fetches the latest health-related news using NewsAPI.
 * Displays the news articles in the `newsContainer` element.
 * 
 * @async
 * @function fetchNews
 */
async function fetchNews() {
    if (!newsContainer) return;
    
    const apiKey = '8cf220f2e3f548b78aa38afc2f12b039';
    const url = `http://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}`;

    try {
        // Display loading message while fetching the data
        newsContainer.innerHTML = `<p>Loading news...</p>`;
        
        // Fetch the data from the NewsAPI
        const response = await fetch(url) ;

        // If the response is not okay, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Convert the response to JSON format
        const data = await response.json();
        
        // Display the fetched articles
        displayNews(data.articles);
    } catch (error) {
        // Handle errors and display an error message
        newsContainer.innerHTML = `<p class="error">Error fetching news: ${error.message}</p>`;
    }
}

/**
 * Displays the news articles in the `newsContainer` element.
 * 
 * @function displayNews
 * @param {Array} articles - An array of news article objects.
 */
function displayNews(articles) {
    if (!newsContainer) return;
    
    // If no articles are found, display a message
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }

    // Display up to 12 articles in the container
    newsContainer.innerHTML = articles
        .slice(0, 12) // Display only the first 12 articles
        .map(article => `
            <div class="news-article">
                <img src="${article.urlToImage || 'http://via.placeholder.com/300?text=No+Image'}" alt="News Image">
                <div class="news-content">
                    <h3><a href="${article.url}" target="_blank">${article.title || "No title available"}</a></h3>
                    <p>${article.description ? article.description.substring(0, 80)  + '...' : "No description available."}</p>
                    <p><strong>Source:</strong> ${article.source.name || "Unknown"} | <strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
}

/**
 * Event listener that runs once the DOM content is loaded.
 * It initializes the news module.
 * 
 * @event document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initNewsModule();
});

// Export functions for use in other modules
export { fetchNewsForCountry };
