/**
 * @module NewsModule
 * @description A module to fetch and display news from various sources.
 */

// The container where news will be displayed
const newsContainer = document.getElementById('newsContainer');

// Available news sources
const NEWS_SOURCES = [
  fetchRedditNews,
  fetchBBCNews,
  fetchWikipediaNews
];

/**
 * Initializes the news module by showing loading state and fetching combined news.
 */
function initNewsModule() {
  showLoading();
  fetchCombinedNews();
}

/**
 * Fetches news from all available sources and handles errors using Promise.any.
 */
async function fetchCombinedNews() {
  try {
    const articles = await Promise.any(NEWS_SOURCES.map(fn => fn()));
    displayNews(articles);
    localStorage.setItem('cachedNews', JSON.stringify(articles));
  } catch (err) {
    showError('Failed to connect to news sources. Displaying cached data.');
    loadCachedNews();
  }
}

/**
 * Fetches news filtered by a specific country name.
 * @param {string} country - The name of the country to filter news for.
 */
async function fetchNewsForCountry(country) {
  try {
    showLoading();
    const articles = await Promise.any(NEWS_SOURCES.map(fn => fn()));
    const filteredArticles = articles.filter(article =>
      article.title.toLowerCase().includes(country.toLowerCase()) ||
      article.description.toLowerCase().includes(country.toLowerCase())
    );
    displayNews(filteredArticles.length > 0 ? filteredArticles : articles);
  } catch (err) {
    showError('Failed to connect to news sources. Displaying cached data.');
    loadCachedNews();
  }
}

/**
 * Fetches news from Reddit's health subreddit.
 * @returns {Promise<Object[]>} An array of news articles.
 * @throws Will throw an error if fetching fails.
 */
async function fetchRedditNews() {
  try {
    const res = await fetch('https://www.reddit.com/r/health/top.json?limit=10');
    const data = await res.json();
    return data.data.children.map(post => ({
      title: post.data.title,
      description: post.data.selftext,
      url: `https://reddit.com${post.data.permalink}`,
      image: post.data.thumbnail || './assets/images/news-placeholder.jpg',
      date: new Date(post.data.created_utc * 1000),
      source: 'Reddit'
    }));
  } catch {
    throw new Error('Reddit failed');
  }
}

/**
 * Fetches news from BBC via RSS feed.
 * @returns {Promise<Object[]>} An array of news articles.
 * @throws Will throw an error if fetching fails.
 */
async function fetchBBCNews() {
  try {
    const proxy = 'https://api.allorigins.win/raw?url=';
    const rssUrl = 'https://feeds.bbci.co.uk/news/health/rss.xml';
    const res = await fetch(proxy + encodeURIComponent(rssUrl));
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = xml.querySelectorAll('item');
    return Array.from(items).map(item => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      url: item.querySelector('link').textContent,
      image: item.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || './assets/images/news-placeholder.jpg',
      date: new Date(item.querySelector('pubDate').textContent),
      source: 'BBC News'
    }));
  } catch {
    throw new Error('BBC failed');
  }
}

/**
 * Fetches current events from Wikipedia.
 * @returns {Promise<Object[]>} An array of news articles.
 * @throws Will throw an error if fetching fails.
 */
async function fetchWikipediaNews() {
  try {
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/html/Portal:Current_events');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const events = doc.querySelectorAll('.vevent');
    return Array.from(events).map(event => ({
      title: event.querySelector('.summary')?.textContent.trim() || 'حدث جاري',
      description: event.textContent.trim(),
      url: 'https://en.wikipedia.org/wiki/Portal:Current_events',
      image: './assets/images/news-placeholder.jpg',
      date: new Date(),
      source: 'Wikipedia'
    }));
  } catch {
    throw new Error('Wikipedia failed');
  }
}

/**
 * Displays news articles in the news container.
 * @param {Object[]} articles - An array of news articles to display.
 */
function displayNews(articles) {
  if (!articles?.length) return showError('No news available');
  newsContainer.innerHTML = articles.slice(0, 10).map(article => `
    <article class="news-card">
      <img src="${article.image}" alt="${article.title}" 
           onerror="this.src='./assets/images/news-placeholder.jpg'">
      <div class="content">
        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
        <p>${article.description.substring(0, 150)}...</p>
        <div class="meta">
          <span class="source">${article.source}</span>
          <time>${article.date.toLocaleDateString()}</time>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * Loads cached news from localStorage.
 */
function loadCachedNews() {
  const cached = localStorage.getItem('cachedNews');
  if (cached) displayNews(JSON.parse(cached));
}

/**
 * Shows a loading spinner while fetching news.
 */
function showLoading() {
  newsContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading news...</p>
    </div>
  `;
}

/**
 * Displays an error message in the news container.
 * @param {string} msg - The error message to display.
 */
function showError(msg) {
  newsContainer.innerHTML = `
    <div class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${msg}</p>
    </div>
  `;
}

/**
 * Exports the NewsModule with initialization and country-specific news fetching functions.
 */
export const NewsModule = {
  init: initNewsModule,
  fetchNewsForCountry
};

/**
 * Initializes the news module when the DOM is fully loaded.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsModule);
} else {
  initNewsModule();
}