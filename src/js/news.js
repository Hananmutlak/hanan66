
const newsContainer = document.getElementById('newsContainer');
const newsHeading = document.getElementById('newsHeading');
let allArticles = [];
const apiKey = '8cf220f2e3f548b78aa38afc2f12b039'; // استبدل بمفتاحك

document.addEventListener('DOMContentLoaded', initNewsModule);

function initNewsModule() {
    const selectedCountry = localStorage.getItem('selectedCountry');
    selectedCountry ? fetchNewsForCountry(selectedCountry) : fetchGeneralNews();
}

async function fetchGeneralNews() {
    try {
        showLoading();
        const url = `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=30&apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        allArticles = data.articles;
        displayNews(allArticles);
    } catch (error) {
        showError(error);
    }
}
async function fetchNewsForCountry(country) {
    try {
        showLoading();
        newsHeading.textContent = `Latest Health News for ${country}`;
        const query = `(disease OR health OR virus) AND ${country}`;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        allArticles = data.articles;
        displayNews(allArticles);
    } catch (error) {
        showError(error);
        fetchGeneralNews();
    }
}

function showLoading() {
    newsContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-newspaper"></i>
            <p>Loading health news...</p>
        </div>
    `;
}

function displayNews(articles) {
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = `
            <div class="no-articles">
                <i class="fas fa-info-circle"></i>
                <p>No news articles available at the moment.</p>
            </div>
        `;
        return;
    }

    newsContainer.innerHTML = articles.map(article => `
        <div class="news-article">
            <div class="news-image-container">
                <img src="${article.urlToImage || './assets/images/news-placeholder.jpg'}" 
                     alt="${article.title || 'News image'}"
                     class="news-image"
                     onerror="this.onerror=null;this.src='./assets/images/news-placeholder.jpg'">
            </div>
            <div class="news-content">
                <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title || "No title available"}</a></h3>
                <p class="news-description">${article.description?.substring(0, 150) || "No description available"}...</p>
                <div class="news-meta">
                    <span><i class="fas fa-source"></i> ${article.source?.name || "Unknown source"}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${formatDate(article.publishedAt)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return "Unknown date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showError(error) {
    console.error('Error:', error);
    newsContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading news: ${error.message}</p>
            <button class="retry-btn" onclick="window.location.reload()">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `;
}

// للاستدعاء من الصفحات الأخرى
window.updateNewsForCountry = (country) => {
    fetchNewsForCountry(country);
};