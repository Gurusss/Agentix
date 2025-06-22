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
            // Сбрасываем трансформацию и настраиваем скролл
            track.style.transform = 'none';
            track.style.transition = 'none';
            track.style.display = 'flex';
            track.style.flexWrap = 'nowrap';
            track.style.overflowX = 'auto';
            track.style.scrollSnapType = 'x mandatory';
            track.style.webkitOverflowScrolling = 'touch';
            track.style.msOverflowStyle = 'none';
            track.style.scrollbarWidth = 'none';
            
            // Важно для мобильной версии - адаптивная ширина трека
            // Рассчитываем ширину карточки адаптивно
            const viewportWidth = window.innerWidth;
            const cardWidth = Math.min(Math.max(viewportWidth * 0.85, 300), 360); // 85% ширины экрана, но не меньше 300px и не больше 360px
            const marginRight = 15;
            const totalWidth = allCards.length * (cardWidth + marginRight);
            
            // Устанавливаем ширину трека
            track.style.width = `${totalWidth}px`;
            track.style.minWidth = `${totalWidth}px`;

            // Добавляем отступы для центрирования
            const padding = (carousel.offsetWidth - cardWidth) / 2;
            container.style.paddingLeft = `${Math.max(padding, 15)}px`;
            container.style.paddingRight = `${Math.max(padding, 15)}px`;

            // Настраиваем каждую карточку
            allCards.forEach(card => {
                card.style.scrollSnapAlign = 'center';
                card.style.flexShrink = '0';
                card.style.width = `${cardWidth}px`;
                card.style.marginRight = `${marginRight}px`;
                card.style.display = 'block'; // Важно: убедиться, что карточки видимы
            });

            // Скрываем кнопки навигации в мобильной версии
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            
            // Добавляем обработчик скролла для плавного свайпа
            track.addEventListener('touchstart', handleTouchStart, { passive: true });
            track.addEventListener('touchmove', handleTouchMove, { passive: true });
            
            // Прокручиваем к первому элементу с небольшой задержкой
            setTimeout(() => {
                if (allCards[1]) {
                    allCards[1].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            }, 300);
        } else {
            // На десктопе управляем через transform
            track.style.overflowX = 'visible';
            track.style.scrollSnapType = 'none';
            track.style.paddingLeft = '0';
            track.style.paddingRight = '0';
            track.style.width = '';
            track.style.minWidth = '';
            
            allCards.forEach(card => {
                card.style.scrollSnapAlign = 'none';
                card.style.marginRight = '';
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

    // Улучшенная поддержка свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isSwiping = false;
    let isScrollingVertically = false;

    // Улучшенный обработчик начала касания
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
        isScrollingVertically = false;
    }, { passive: true });

    // Добавляем обработчик движения пальца
    track.addEventListener('touchmove', (e) => {
        if (isScrollingVertically) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = touchStartX - currentX;
        const diffY = touchStartY - currentY;
        
        // Определяем, является ли это вертикальным скроллом
        if (!isSwiping && !isScrollingVertically) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Горизонтальное движение - свайп
                isSwiping = true;
            } else {
                // Вертикальное движение - скролл страницы
                isScrollingVertically = true;
            }
        }
    }, { passive: true });

    // Обработчик окончания касания
    track.addEventListener('touchend', (e) => {
        if (isScrollingVertically) return;
        
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        if (isSwiping) {
            handleSwipe();
        }
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 40; // Уменьшаем порог для более чувствительного свайпа
        const diffX = touchStartX - touchEndX;
        
        if (diffX > swipeThreshold) {
            // Свайп влево - следующий слайд
            if (isMobile) {
                // В мобильной версии плавно прокручиваем к следующей карточке
                const nextCard = allCards[Math.min(currentIndex + 1, allCards.length - 1)];
                if (nextCard) {
                    nextCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            } else {
                goToSlide(currentIndex + 1);
            }
        } else if (diffX < -swipeThreshold) {
            // Свайп вправо - предыдущий слайд
            if (isMobile) {
                // В мобильной версии плавно прокручиваем к предыдущей карточке
                const prevCard = allCards[Math.max(currentIndex - 1, 0)];
                if (prevCard) {
                    prevCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            } else {
                goToSlide(currentIndex - 1);
            }
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
