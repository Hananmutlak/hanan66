!function(e,n,t,r,i,o,a,s){var l="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},u="function"==typeof l[r]&&l[r],d=u.i||{},f=u.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function p(n,t){if(!f[n]){if(!e[n]){if(i[n])return i[n];var o="function"==typeof l[r]&&l[r];if(!t&&o)return o(n,!0);if(u)return u(n,!0);if(c&&"string"==typeof n)return c(n);var a=Error("Cannot find module '"+n+"'");throw a.code="MODULE_NOT_FOUND",a}d.resolve=function(t){var r=e[n][1][t];return null!=r?r:t},d.cache={};var s=f[n]=new p.Module(n);e[n][0].call(s.exports,d,s,s.exports,l)}return f[n].exports;function d(e){var n=d.resolve(e);return!1===n?{}:p(n)}}p.isParcelRequire=!0,p.Module=function(e){this.id=e,this.bundle=p,this.require=c,this.exports={}},p.modules=e,p.cache=f,p.parent=u,p.distDir=void 0,p.publicUrl=void 0,p.devServer=void 0,p.i=d,p.register=function(n,t){e[n]=[function(e,n){n.exports=t},{}]},Object.defineProperty(p,"root",{get:function(){return l[r]}}),l[r]=p;for(var h=0;h<n.length;h++)p(n[h]);if(t){var g=p(t);"object"==typeof exports&&"undefined"!=typeof module?module.exports=g:"function"==typeof define&&define.amd&&define(function(){return g})}}({juMe2:[function(e,n,t,r){let i=document.getElementById("newsContainer");function o(){a()}async function a(){if(i){i.innerHTML='<div class="loading-spinner"><p>Loading latest health news...</p></div>';try{let e=await fetch("https://gnews.io/api/v4/top-headlines?category=health&lang=en&max=10&apikey=YOUR_GNEWS_API_KEY");if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);let n=await e.json();!function(e){if(!e?.length){i.innerHTML="<p>No news articles found.</p>";return}i.innerHTML=e.map(e=>` 
        <article class="news-article">
            <img src="${e.image||"./assets/images/news-placeholder.jpg"}" 
                 alt="${e.title||"News image"}"
                 onerror="this.src='./assets/images/news-placeholder.jpg'">
            <div class="news-content">
                <h3><a href="${e.url}" target="_blank" rel="noopener noreferrer">
                    ${e.title||"No title available"}
                </a></h3>
                <p>${e.description?.substring(0,100)||"No description available"}...</p>
                <footer>
                    <span>${e.source?.name||"Unknown source"}</span>
                    <time>${new Date(e.publishedAt).toLocaleDateString()}</time>
                </footer>
            </div>
        </article>
    `).join("")}(n.articles)}catch(n){var e;e=`Error fetching news: ${n.message}`,i.innerHTML=`<p class="error">${e}</p>`}}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",o):o()},{}]},["juMe2"],"juMe2","parcelRequire5828",{});
//# sourceMappingURL=news.6d754e42.js.map
