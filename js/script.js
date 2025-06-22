document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Lucide иконок
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Мобильное меню
    const burgerBtn = document.querySelector('.header__burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.querySelector('.mobile-menu__overlay');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    const body = document.body;

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        overlay.classList.add('open');
        burgerBtn.classList.add('is-active');
        body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('open');
        burgerBtn.classList.remove('is-active');
        body.style.overflow = '';
    }

    function isMobile() {
        return window.innerWidth <= 992;
    }

    if (burgerBtn && mobileMenu && overlay) {
        burgerBtn.addEventListener('click', (e) => {
            // Меню должно работать на всех устройствах
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        overlay.addEventListener('click', () => {
            closeMobileMenu();
        });

        // Добавляем обработчик для крестика закрытия
        const closeBtn = document.querySelector('.mobile-menu__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeMobileMenu();
            });
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        window.addEventListener('resize', () => {
            if (!isMobile()) closeMobileMenu();
        });
    }

    // Анимация появления элементов при скролле
    const animatedElements = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Обработка отправки формы
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Собираем данные из формы
            const name = this.querySelector('#name').value;
            const telegram = this.querySelector('#telegram').value;
            const messageText = this.querySelector('#message').value;

            // Ваши данные
            const TOKEN = "7584161182:AAEwLS8WnxN9xzDs4qPVdeL008fj5DukS7c";
            const CHAT_ID = "194510663";

            // Формируем сообщение
            let message = `<b>Новая заявка с сайта!</b>\n`;
            message += `<b>Имя:</b> ${name}\n`;
            message += `<b>Telegram:</b> ${telegram}\n`;
            message += `<b>Сообщение:</b> ${messageText}`;

            const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=html`;

            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        submitBtn.textContent = 'Отправлено!';
                        this.reset();
                    } else {
                        throw new Error(data.description);
                    }
                })
                .catch(error => {
                    console.error('Ошибка отправки:', error);
                    submitBtn.textContent = 'Ошибка!';
                    submitBtn.style.backgroundColor = '#d9534f'; // Красный цвет для ошибки
                })
                .finally(() => {
                    setTimeout(() => {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '';
                    }, 4000);
                });
        });
    }
});
