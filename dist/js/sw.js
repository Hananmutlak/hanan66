const CACHE_NAME = 'disease-tracker-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/statistics.html',
    '/map.html',
    '/prevention.html',
    '/contact.html',
    '/news.html',
    '/src/scss/main.scss',
    '/src/scss/news.scss',
    '/src/js/main.js',
    '/src/js/map.js',
    '/src/js/news.js',
    '/src/js/charts.js',
    '/src/assets/images/hero-bg.jpg',
    '/src/assets/images/virus1.svg',
    '/src/assets/images/virus1.png'
];
// تثبيت Service Worker وتخزين الملفات المطلوبة
self.addEventListener('install', (event)=>{
    event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(urlsToCache)).then(()=>self.skipWaiting()));
});
// تنشيط Service Worker وحذف التخزينات القديمة
self.addEventListener('activate', (event)=>{
    const cacheWhitelist = [
        CACHE_NAME
    ];
    event.waitUntil(caches.keys().then((cacheNames)=>{
        return Promise.all(cacheNames.map((cacheName)=>{
            if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
        }));
    }).then(()=>self.clients.claim()));
});
// استراتيجية التخزين المؤقت: Network First للـ API وCache First للموارد الثابتة
self.addEventListener('fetch', (event)=>{
    const requestUrl = new URL(event.request.url);
    // تعامل خاص مع طلبات API
    if (event.request.url.includes('newsapi.org') || event.request.url.includes('disease.sh')) // استراتيجية Network First للـ API مع تخزين مؤقت للاستخدام في حالة عدم الاتصال
    event.respondWith(fetch(event.request).then((response)=>{
        // نسخ الاستجابة لأننا سنستخدمها مرتين
        const responseToCache = response.clone();
        // تخزين الاستجابة في التخزين المؤقت
        caches.open(CACHE_NAME).then((cache)=>{
            // تخزين الاستجابة فقط إذا كانت ناجحة
            if (response.status === 200) {
                // إضافة رأس لتحديد وقت التخزين
                const headers = new Headers(responseToCache.headers);
                headers.append('sw-fetched-on', new Date().toISOString());
                // إنشاء استجابة جديدة مع الرأس المضاف
                const responseToStore = new Response(responseToCache.body, {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: headers
                });
                // تخزين الاستجابة مع وقت انتهاء الصلاحية (30 دقيقة)
                cache.put(event.request, responseToStore);
            }
        });
        return response;
    }).catch(()=>{
        // في حالة فشل الاتصال، استخدم النسخة المخزنة مؤقتًا
        return caches.match(event.request).then((cachedResponse)=>{
            if (cachedResponse) {
                // التحقق من عمر البيانات المخزنة
                const fetchedOn = new Date(cachedResponse.headers.get('sw-fetched-on'));
                const ageInMinutes = (new Date() - fetchedOn) / 60000;
                // إذا كانت البيانات أقدم من ساعة، عرض إشعار للمستخدم
                if (ageInMinutes > 60) // يمكن إضافة رمز هنا لإظهار إشعار للمستخدم بأن البيانات قديمة
                console.warn('Using cached data that is older than 1 hour');
                return cachedResponse;
            }
            // إذا لم تكن هناك نسخة مخزنة، عرض رسالة خطأ
            return new Response(JSON.stringify({
                error: 'You are offline and no cached data is available'
            }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
        });
    }));
    else // استراتيجية Cache First للموارد الثابتة
    event.respondWith(caches.match(event.request).then((response)=>{
        // إذا وجدت في التخزين المؤقت، أعد النسخة المخزنة
        if (response) return response;
        // إذا لم تكن موجودة في التخزين المؤقت، قم بجلبها من الشبكة
        return fetch(event.request).then((networkResponse)=>{
            // تخزين الاستجابة الجديدة في التخزين المؤقت
            if (networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache)=>{
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
        });
    }));
});
// استراتيجية تحديث التخزين المؤقت في الخلفية
self.addEventListener('sync', (event)=>{
    if (event.tag === 'update-cache') event.waitUntil(caches.open(CACHE_NAME).then((cache)=>{
        return Promise.all(urlsToCache.map((url)=>{
            return fetch(url).then((response)=>{
                if (response.status === 200) return cache.put(url, response);
            }).catch((error)=>console.error('Background sync failed:', error));
        }));
    }));
});

//# sourceMappingURL=sw.js.map
