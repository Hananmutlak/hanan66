
/// <reference lib="WebWorker" />
const self = globalThis.self;
const CACHE_NAME = 'hanan66-final-v2'; // غيرنا رقم الإصدار
const API_CACHE_NAME = 'hanan66-api-v1';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  './',
  './index.html',
  './statistics.html',
  './map.html',
  './prevention.html',
  './contact.html',
  './news.html',
  './css/main.css',
  './js/main.js',
  './js/map.js',
  './js/news.js',
  './js/charts.js',
  './assets/images/hero-bg.jpg',
  './assets/images/virus1.svg',
  './assets/images/virus1.png'
];

// ===== التثبيت =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opening cache');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('All resources cached');
            return self.skipWaiting();
          })
          .catch(err => {
            console.error('Cache addAll error:', err);
            throw err;
          });
      })
  );
});

// ===== التنشيط =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      ).then(() => {
        console.log('Claiming clients');
        return self.clients.claim();
      });
    })
  );
});

// ===== معالجة الطلبات =====
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // طلبات API
  if (event.request.url.includes('newsapi.org') || 
      event.request.url.includes('disease.sh')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // الملفات الثابتة
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          console.log('Serving from cache:', event.request.url);
          return cached;
        }
        return fetchAndCache(event.request);
      })
      .catch(() => fallbackResponse(event.request))
  );
});

async function handleApiRequest(request) {
  try {
    const httpsRequest = new Request(
      request.url.replace('http://', 'https://'),
      request
    );
    
    const response = await fetch(httpsRequest);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('API request failed:', err);
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({error: 'Network error'}),
      {status: 503, headers: {'Content-Type': 'application/json'}}
    );
  }
}

async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}

function fallbackResponse(request) {
  if (request.mode === 'navigate') {
    return caches.match(OFFLINE_URL) || 
           new Response('<h1>Offline</h1>', {headers: {'Content-Type': 'text/html'}});
  }
  return new Response('Offline', {status: 503});
}

// ===== معالجة الرسائل =====
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    console.log('Skipping waiting');
    self.skipWaiting();
  }
});