/**
 * @module NewsModule
 * @description Handles fetching and displaying health-related news
 */

const NEWS_API_KEY = 'YOUR_GNEWS_API_KEY';

const newsContainer = document.getElementById('newsContainer');

function initNewsModule() {
    fetchNews();
}

async function fetchNews() {
    if (!newsContainer) return;
    
    showLoadingMessage("Loading latest health news...");
    
    try {
        const url = `https://gnews.io/api/v4/top-headlines?category=health&lang=en&max=10&apikey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        showErrorMessage(`Error fetching news: ${error.message}`);
    }
}

function showLoadingMessage(msg) {
    newsContainer.innerHTML = `<div class="loading-spinner"><p>${msg}</p></div>`;
}

function showErrorMessage(msg) {
    newsContainer.innerHTML = `<p class="error">${msg}</p>`;
}

function displayNews(articles) {
    if (!articles?.length) {
        newsContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }

    newsContainer.innerHTML = articles.map(article => ` 
        <article class="news-article">
            <img src="${article.image || './assets/images/news-placeholder.jpg'}" 
                 alt="${article.title || 'News image'}"
                 onerror="this.src='./assets/images/news-placeholder.jpg'">
            <div class="news-content">
                <h3><a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    ${article.title || "No title available"}
                </a></h3>
                <p>${article.description?.substring(0, 100) || "No description available"}...</p>
                <footer>
                    <span>${article.source?.name || "Unknown source"}</span>
                    <time>${new Date(article.publishedAt).toLocaleDateString()}</time>
                </footer>
            </div>
        </article>
    `).join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsModule);
} else {
    initNewsModule();
}