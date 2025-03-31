!function(e,n,t,i,a,o,r,s){var l="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},c="function"==typeof l[i]&&l[i],d=c.i||{},u=c.cache||{},f="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function p(n,t){if(!u[n]){if(!e[n]){if(a[n])return a[n];var o="function"==typeof l[i]&&l[i];if(!t&&o)return o(n,!0);if(c)return c(n,!0);if(f&&"string"==typeof n)return f(n);var r=Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r}d.resolve=function(t){var i=e[n][1][t];return null!=i?i:t},d.cache={};var s=u[n]=new p.Module(n);e[n][0].call(s.exports,d,s,s.exports,l)}return u[n].exports;function d(e){var n=d.resolve(e);return!1===n?{}:p(n)}}p.isParcelRequire=!0,p.Module=function(e){this.id=e,this.bundle=p,this.require=f,this.exports={}},p.modules=e,p.cache=u,p.parent=c,p.distDir=void 0,p.publicUrl=void 0,p.devServer=void 0,p.i=d,p.register=function(n,t){e[n]=[function(e,n){n.exports=t},{}]},Object.defineProperty(p,"root",{get:function(){return l[i]}}),l[i]=p;for(var g=0;g<n.length;g++)p(n[g]);if(t){var h=p(t);"object"==typeof exports&&"undefined"!=typeof module?module.exports=h:"function"==typeof define&&define.amd&&define(function(){return h})}}({juMe2:[function(e,n,t,i){javascript,Copy;let a=document.getElementById("newsContainer"),o=document.getElementById("newsHeading"),r=[],s="8cf220f2e3f548b78aa38afc2f12b039";async function l(){try{d();let e=`https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=30&apiKey=${s}`,n=await fetch(e);r=(await n.json()).articles,u(r)}catch(e){f(e)}}async function c(e){try{d(),o.textContent=`Latest Health News for ${e}`;let n=`(disease OR health OR virus) AND ${e}`,t=`https://newsapi.org/v2/everything?q=${encodeURIComponent(n)}&language=en&sortBy=publishedAt&apiKey=${s}`,i=await fetch(t);if(!i.ok)throw Error("Network response was not ok");r=(await i.json()).articles,u(r)}catch(e){f(e),l()}}function d(){a.innerHTML=`
        <div class="loading-spinner">
            <i class="fas fa-newspaper"></i>
            <p>Loading health news...</p>
        </div>
    `}function u(e){if(!e||0===e.length){a.innerHTML=`
            <div class="no-articles">
                <i class="fas fa-info-circle"></i>
                <p>No news articles available at the moment.</p>
            </div>
        `;return}a.innerHTML=e.map(e=>{var n;return`
        <div class="news-article">
            <div class="news-image-container">
                <img src="${e.urlToImage||"./assets/images/news-placeholder.jpg"}" 
                     alt="${e.title||"News image"}"
                     class="news-image"
                     onerror="this.onerror=null;this.src='./assets/images/news-placeholder.jpg'">
            </div>
            <div class="news-content">
                <h3><a href="${e.url}" target="_blank" rel="noopener">${e.title||"No title available"}</a></h3>
                <p class="news-description">${e.description?.substring(0,150)||"No description available"}...</p>
                <div class="news-meta">
                    <span><i class="fas fa-source"></i> ${e.source?.name||"Unknown source"}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${(n=e.publishedAt)?new Date(n).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Unknown date"}</span>
                </div>
            </div>
        </div>
    `}).join("")}function f(e){console.error("Error:",e),a.innerHTML=`
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading news: ${e.message}</p>
            <button class="retry-btn" onclick="window.location.reload()">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `}document.addEventListener("DOMContentLoaded",function(){let e=localStorage.getItem("selectedCountry");e?c(e):l()}),window.updateNewsForCountry=e=>{c(e)}},{}]},["juMe2"],"juMe2","parcelRequire1875",{});
//# sourceMappingURL=news.d0be1a82.js.map
