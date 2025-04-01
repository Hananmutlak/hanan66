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
        
        document.addEventListener('countrySelected', (event) => {
            if (event.detail?.country) {
                const mapSection = document.getElementById('map');
                if (mapSection) {
                    let newsButton = document.getElementById('goToNewsButton') || 
                        createNewsButton(mapSection);
                    
                    newsButton.textContent = `View All News for ${event.detail.country}`;
                    newsButton.onclick = () => {
                        localStorage.setItem('selectedCountry', event.detail.country);
                        window.location.href = 'news.html';
                    };
                }
            }
        });
    }
    
    if (currentPage === 'news.html') {
        const selectedCountry = localStorage.getItem('selectedCountry');
        if (selectedCountry) {
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('countrySelected', {
                    detail: { country: selectedCountry },
                    bubbles: true
                }));
                localStorage.removeItem('selectedCountry');
            }, 500);
        }
    }
    
    if (currentPage === 'statistics.html') renderCharts();
});

// وظيفة مساعدة لإنشاء زر الأخبار
function createNewsButton(container) {
    const button = document.createElement('button');
    button.id = 'goToNewsButton';
    button.className = 'btn';
    Object.assign(button.style, {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#FF6500',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    });
    container.appendChild(button);
    return button;
}

// تسجيل Service Worker (منفصل عن DOMContentLoaded)
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        const swUrl = new URL('sw.js', import.meta.url).href;
        navigator.serviceWorker.register(swUrl, {
            scope: '/hanan66/',
            type: 'module'
        })
        .then(reg => {
            console.log('Service Worker registered with scope:', reg.scope);
            
            // التحقق من التحديثات كل ساعة
            setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch(err => console.error('Service Worker registration failed:', err));
    }
});