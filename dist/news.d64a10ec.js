/**
 * Fetches the latest health-related news using NewsAPI.
 * Displays the news articles in the `newsContainer` element.
 * 
 * @async
 * @function fetchNews
 */ async function fetchNews() {
    const apiKey = '8cf220f2e3f548b78aa38afc2f12b039';
    const url = `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}`;
    try {
        // Display loading message while fetching the data
        newsContainer.innerHTML = `<p>Loading news...</p>`;
        // Fetch the data from the NewsAPI
        const response = await fetch(url);
        // If the response is not okay, throw an error
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
 */ function displayNews(articles) {
    // If no articles are found, display a message
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }
    // Display up to 12 articles in the container
    newsContainer.innerHTML = articles.slice(0, 12) // Display only the first 12 articles
    .map((article)=>`
            <div class="news-article">
                <img src="${article.urlToImage || 'https://via.placeholder.com/300'}" alt="News Image">
                <div class="news-content">
                    <h3><a href="${article.url}" target="_blank">${article.title || "No title available"}</a></h3>
                    <p>${article.description ? article.description.substring(0, 80) + '...' : "No description available."}</p>
                    <p><strong>Source:</strong> ${article.source.name || "Unknown"} | <strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
}
/**
 * Event listener that runs once the DOM content is loaded.
 * It calls `fetchNews` to load the news.
 * 
 * @event document#DOMContentLoaded
 */ document.addEventListener('DOMContentLoaded', ()=>{
    // Fetch and display the latest news
    fetchNews();
});

//# sourceMappingURL=news.d64a10ec.js.map
