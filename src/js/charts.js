/**
 * @module ChartModule
 * @description يتعامل مع إنشاء وعرض مخططات البيانات لإحصائيات الأمراض
 * @requires chart.js/auto
 */

import Chart from 'chart.js/auto';

/**
 * تهيئة وعرض المخططات البيانية لإحصائيات الأمراض
 * @function renderCharts
 * @description ينشئ ويعرض مخططات الأعمدة والدائرة لعرض إحصائيات الأمراض
 * @example
 * // استدعاء الدالة لعرض المخططات
 * renderCharts();
 */
export function renderCharts() {
    const mainChartCanvas = document.getElementById('mainChart');
    const pieChartCanvas = document.getElementById('pieChart');
    
    // التحقق من وجود العناصر الأساسية
    if (!mainChartCanvas || !pieChartCanvas) {
        console.error('Canvas elements not found!');
        return;
    }

    let mainChart, pieChart;

    /**
     * إنشاء المخططات البيانية
     * @private
     * @param {number} cases - عدد الحالات
     * @param {number} deaths - عدد الوفيات
     * @param {number} recovered - عدد المتعافين
     */
    const createCharts = (cases, deaths, recovered) => {
        // تدمير الرسوم البيانية القديمة إذا وجدت
        if (mainChart) mainChart.destroy();
        if (pieChart) pieChart.destroy();

        // إنشاء الرسم البياني الرئيسي (العامودي)
        mainChart = new Chart(mainChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Cases', 'Deaths', 'Recovered'],
                datasets: [{
                    label: 'Statistics',
                    data: [cases, deaths, recovered],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(75, 192, 192, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // إنشاء الرسم الدائري (Pie Chart)
        pieChart = new Chart(pieChartCanvas, {
            type: 'pie',
            data: {
                labels: ['Active', 'Deaths', 'Recovered'],
                datasets: [{
                    data: [cases - deaths - recovered, deaths, recovered],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    };

    /**
     * جلب البيانات من API وعرضها في المخططات
     * @private
     * @async
     * @param {string} disease - نوع المرض (covid أو flu)
     * @throws {Error} عند فشل جلب البيانات
     */
    const fetchData = async (disease) => {
        try {
            let data;
            if (disease === 'covid') {
                const res = await fetch('https://disease.sh/v3/covid-19/all') ;
                data = await res.json();
                createCharts(data.cases, data.deaths, data.recovered);
            } else if (disease === 'flu') {
                // بيانات افتراضية للإنفلونزا
                createCharts(1000000, 5000, 950000);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // التحقق من وجود عنصر الاختيار (دروب داون) قبل إضافة الحدث
    const diseaseSelect = document.getElementById('diseaseSelect');
    if (diseaseSelect) {
        /**
         * معالج حدث تغيير نوع المرض
         * @private
         * @listens change
         */
        diseaseSelect.addEventListener('change', (e) => {
            fetchData(e.target.value);
        });
    }

    // تحميل البيانات الأولية
    fetchData('covid');
}
