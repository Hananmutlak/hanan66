import { initMap, getSelectedCountry } from './map.js';
import { renderCharts } from './charts.js';
import { fetchNewsForCountry } from './news.js';


document.addEventListener('DOMContentLoaded', () => {
    // إدارة القائمة على جميع الصفحات
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && !e.target.matches('.menu-icon')) {
                navLinks.classList.remove('active');
            }
        });

        // إغلاق القائمة عند تغيير حجم الشاشة
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
            }
        });
    }

    // تهيئة المكونات حسب الصفحة
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'map.html') {
        initMap();
        
        // إضافة زر للانتقال إلى صفحة الأخبار مع الدولة المحددة
        document.addEventListener('countrySelected', (event) => {
            if (event.detail && event.detail.country) {
                // إنشاء زر للانتقال إلى صفحة الأخبار
                const mapSection = document.getElementById('map');
                if (mapSection) {
                    // التحقق من وجود زر الانتقال
                    let newsButton = document.getElementById('goToNewsButton');
                    if (!newsButton) {
                        newsButton = document.createElement('button');
                        newsButton.id = 'goToNewsButton';
                        newsButton.className = 'btn';
                        newsButton.style.marginTop = '20px';
                        newsButton.style.padding = '10px 20px';
                        newsButton.style.backgroundColor = '#FF6500';
                        newsButton.style.color = 'white';
                        newsButton.style.border = 'none';
                        newsButton.style.borderRadius = '5px';
                        newsButton.style.cursor = 'pointer';
                        mapSection.appendChild(newsButton);
                    }
                    
                    newsButton.textContent = `View All News for ${event.detail.country}`;
                    newsButton.onclick = () => {
                        // تخزين الدولة المحددة في localStorage
                        localStorage.setItem('selectedCountry', event.detail.country);
                        // الانتقال إلى صفحة الأخبار
                        window.location.href = 'news.html';
                    };
                }
            }
        });
    }
    
    if (currentPage === 'news.html') {
        // التحقق من وجود دولة محددة في localStorage
        const selectedCountry = localStorage.getItem('selectedCountry');
        if (selectedCountry) {
            // استدعاء وظيفة البحث عن أخبار للدولة المحددة
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('countrySelected', {
                    detail: { country: selectedCountry },
                    bubbles: true
                }));
                // مسح الدولة المحددة من localStorage بعد استخدامها
                localStorage.removeItem('selectedCountry');
            }, 500);
        }
    }
    
    if (currentPage === 'statistics.html') renderCharts();
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), {
            scope: '/',
            type: 'module'
          })
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.log('SW registration failed:', err));
    });
  }
  