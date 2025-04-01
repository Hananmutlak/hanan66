/// <reference lib="WebWorker" />
const self = globalThis.self;
const CACHE_NAME = 'hanan66-final-v3';
const API_CACHE_NAME = 'hanan66-api-v1';
const OFFLINE_URL = './offline.html';

const CACHE_URLS = [
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
  './assets/images/virus1.png',
  './assets/images/news-placeholder.jpg'
];

// ===== التثبيت =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        const cachePromises = CACHE_URLS.map(url => {
          return fetch(new Request(url, {
            credentials: 'same-origin',
            redirect: 'follow',
            mode: 'no-cors'
          }))
          .then(response => {
            if (response.ok || response.type === 'opaque') {
              return cache.put(url, response);
            }
            console.warn(`[SW] Failed to cache ${url}`);
            return Promise.resolve();
          })
          .catch(err => {
            console.warn(`[SW] Skipping ${url}:`, err);
            return Promise.resolve();
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
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
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ===== معالجة الطلبات =====
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // تخطي طلبات غير GET
  if (request.method !== 'GET') return;

  // معالجة طلبات API
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // معالجة الملفات الثابتة
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetchAndCache(request))
      .catch(() => fallbackResponse(request))
  );
});

// ===== دوال مساعدة =====
function isApiRequest(request) {
  return request.url.includes('newsapi.org') || 
         request.url.includes('disease.sh') ||
         request.url.includes('gnews.io');
}

async function handleApiRequest(request) {
  try {
    // تحويل HTTP إلى HTTPS
    const secureRequest = request.url.startsWith('http:') ?
      new Request(request.url.replace('http://', 'https://'), request) :
      request;
    
    const response = await fetch(secureRequest);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('[SW] API request failed:', err);
    const cached = await caches.match(request);
    return cached || apiErrorResponse();
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
    console.error('[SW] Fetch failed:', err);
    throw err;
  }
}

function fallbackResponse(request) {
  if (request.mode === 'navigate') {
    return caches.match(OFFLINE_URL) || 
           offlinePageResponse();
  }
  return offlineDataResponse();
}

function apiErrorResponse() {
  return new Response(
    JSON.stringify({ error: 'Network error' }),
    { status: 503, headers: { 'Content-Type': 'application/json' }}
  );
}

function offlinePageResponse() {
  return new Response(
    '<h1>Offline</h1><p>You are currently offline</p>',
    { headers: { 'Content-Type': 'text/html' }}
  );
}

function offlineDataResponse() {
  return new Response('Offline', { status: 503 });
}

// ===== معالجة الرسائل =====
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    console.log('[SW] Skipping waiting');
    self.skipWaiting();
  }
});