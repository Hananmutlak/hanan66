async function fetchNews(){try{newsContainer.innerHTML="<p>Loading news...</p>";let e=await fetch("https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=8cf220f2e3f548b78aa38afc2f12b039");if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);let n=await e.json();displayNews(n.articles)}catch(e){newsContainer.innerHTML=`<p class="error">Error fetching news: ${e.message}</p>`}}function displayNews(e){if(!e||0===e.length){newsContainer.innerHTML="<p>No news articles found.</p>";return}newsContainer.innerHTML=e.slice(0,12).map(e=>`
            <div class="news-article">
                <img src="${e.urlToImage||"https://via.placeholder.com/300"}" alt="News Image">
                <div class="news-content">
                    <h3><a href="${e.url}" target="_blank">${e.title||"No title available"}</a></h3>
                    <p>${e.description?e.description.substring(0,80)+"...":"No description available."}</p>
                    <p><strong>Source:</strong> ${e.source.name||"Unknown"} | <strong>Date:</strong> ${new Date(e.publishedAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join("")}document.addEventListener("DOMContentLoaded",()=>{fetchNews()});
//# sourceMappingURL=news.f80d63b7.js.map
