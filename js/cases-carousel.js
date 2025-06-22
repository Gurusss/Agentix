document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.cases-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.cases-carousel__track');
    const prevButton = carousel.querySelector('.cases-carousel__button--prev');
    const nextButton = carousel.querySelector('.cases-carousel__button--next');
    const cards = Array.from(track.children);
    const container = carousel.querySelector('.cases-carousel__container');

    // Клонируем карточки для бесконечной прокрутки
    const cloneFirst = cards[0].cloneNode(true);
    const cloneLast = cards[cards.length - 1].cloneNode(true);
    
    // Добавляем клоны в начало и конец
    track.appendChild(cloneFirst);
    track.insertBefore(cloneLast, cards[0]);
    
    // Обновляем массив карточек с клонами
    const allCards = Array.from(track.children);
    
    let currentIndex = 1; // Начинаем с индекса 1 (первая реальная карточка)
    let isMobile = window.innerWidth <= 767;

    function updateCarousel() {
        isMobile = window.innerWidth <= 767;

        if (isMobile) {
            // На мобильных устройствах используем нативный скролл
            track.style.transform = 'none';
            track.style.overflowX = 'auto';
            track.style.scrollSnapType = 'x mandatory';

            // Динамический расчет отступов для центрирования
            const cardWidth = allCards[1] ? allCards[1].offsetWidth : 320;
            const padding = (carousel.offsetWidth - cardWidth) / 2;
            track.style.paddingLeft = `${padding}px`;
            track.style.paddingRight = `${padding}px`;

            allCards.forEach(card => {
                card.style.scrollSnapAlign = 'center';
            });

            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        } else {
            // На десктопе управляем через transform
            track.style.overflowX = 'visible';
            track.style.scrollSnapType = 'none';
            track.style.paddingLeft = '0';
            track.style.paddingRight = '0';
            allCards.forEach(card => {
                card.style.scrollSnapAlign = 'none';
            });
            prevButton.style.display = 'flex';
            nextButton.style.display = 'flex';
            goToSlide(currentIndex, false); // Переходим к текущему слайду без анимации
        }
    }

    function goToSlide(index, animated = true) {
        // Проверка на переход между клонами и оригиналами
        if (index <= 0) {
            // Если пытаемся перейти к клону в начале
            currentIndex = allCards.length - 2; // Переходим к последней оригинальной карточке
            moveToSlide(currentIndex, false);
            // После мгновенного перехода делаем анимированный переход
            setTimeout(() => moveToSlide(currentIndex, animated), 50);
            return;
        } else if (index >= allCards.length - 1) {
            // Если пытаемся перейти к клону в конце
            currentIndex = 1; // Переходим к первой оригинальной карточке
            moveToSlide(currentIndex, false);
            // После мгновенного перехода делаем анимированный переход
            setTimeout(() => moveToSlide(currentIndex, animated), 50);
            return;
        }

        // Обычный переход
        currentIndex = index;
        moveToSlide(currentIndex, animated);
    }
    
    function moveToSlide(index, animated = true) {
        const card = allCards[index];
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(track).gap) || 30;
        const containerWidth = container.offsetWidth;

        // Центрируем карточку
        const offset = (containerWidth / 2) - (card.offsetLeft + cardWidth / 2);

        track.style.transition = animated ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        track.style.transform = `translateX(${offset}px)`;

        // Убираем ограничения на кнопки, так как карусель бесконечная
        prevButton.disabled = false;
        nextButton.disabled = false;
        prevButton.classList.remove('disabled');
        nextButton.classList.remove('disabled');
    }

    // Обработчики кнопок
    prevButton.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });

    // Поддержка свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Минимальное расстояние для свайпа
        if (touchEndX < touchStartX - swipeThreshold) {
            // Свайп влево - следующий слайд
            goToSlide(currentIndex + 1);
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Свайп вправо - предыдущий слайд
            goToSlide(currentIndex - 1);
        }
    }

    // Обработчик для перехода между клонами
    track.addEventListener('transitionend', () => {
        // Проверяем, находимся ли мы на клоне
        if (currentIndex === 0) {
            // Если мы на первом клоне, переходим к последнему оригиналу
            currentIndex = allCards.length - 2;
            moveToSlide(currentIndex, false);
        } else if (currentIndex === allCards.length - 1) {
            // Если мы на последнем клоне, переходим к первому оригиналу
            currentIndex = 1;
            moveToSlide(currentIndex, false);
        }
    });

    // Инициализация
    updateCarousel();
});
