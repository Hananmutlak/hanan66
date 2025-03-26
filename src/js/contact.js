document.addEventListener('DOMContentLoaded', () => {
    // إدارة القائمة على الجوال
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav')) {
            navLinks.classList.remove('active');
        }
    });

    // إدارة نموذج التواصل
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for contacting us! We will get back to you soon.';
        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);

        contactForm.reset();
    });

    // إزالة الجراثيم عند النقر عليها
    document.querySelectorAll('.germ').forEach(germ => {
        germ.addEventListener('click', function() {
            this.style.animation = 'germFloat 0.5s ease-out';
            setTimeout(() => this.remove(), 500);
        });
    });
});