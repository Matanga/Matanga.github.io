 /*-----------------Carousel Code-------------------------*/
    const carousel = document.querySelector('.img-carousel');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    let carouselImages = document.querySelectorAll('.img-carousel div');

    // Next Carousel
    const nextCarousel = () => {
      const scrollWidth = carousel.scrollWidth;
      const scrollPos = carousel.scrollLeft;
      const containerWidth = carousel.clientWidth;
      const itemWidth = carousel.firstElementChild.clientWidth;
      const itemsInView = Math.round(containerWidth / itemWidth);
      const itemsToScroll = itemsInView === 1 ? 1 : itemsInView - 1;
      const distanceToNext = itemWidth * itemsToScroll;

      if (scrollWidth - scrollPos === containerWidth) {
        carousel.scrollTo(0, 0);
      } else {
        carousel.scrollBy(distanceToNext, 0);
      }
    };

    nextBtn.addEventListener('click', e => {
      nextCarousel();
    });

    // Prev Carousel
    const prevCarousel = () => {
      const scrollWidth = carousel.scrollWidth;
      const scrollPos = carousel.scrollLeft;
      const containerWidth = carousel.clientWidth;
      const itemWidth = carousel.firstElementChild.clientWidth;
      const itemsInView = Math.round(containerWidth / itemWidth);
      const itemsToScroll = itemsInView === 1 ? 1 : itemsInView - 1;
      const distanceToPrev = itemWidth * itemsToScroll;

      if (scrollPos === 0) {
        carousel.scrollTo(scrollWidth, 0);
      } else {
        carousel.scrollBy(-distanceToPrev, 0);
      }
    };

    prevBtn.addEventListener('click', e => {
      prevCarousel();
    });

    // Auto carousel
    const auto = true; // Auto scroll
    const intervalTime = 5000;
    let sliderInterval;

    if (auto) {
      sliderInterval = setInterval(nextCarousel, intervalTime);
    }

    carousel.addEventListener('mouseover', () => {
      clearInterval(sliderInterval);
    });

    carousel.addEventListener('mouseleave', () => {
      if (auto) {
        sliderInterval = setInterval(nextCarousel, intervalTime);
      }
    });

    // for mobile events
    carousel.addEventListener('touchstart', () => {
      clearInterval(sliderInterval);
    });

    carousel.addEventListener('touchend', () => {
      if (auto) {
        sliderInterval = setInterval(nextCarousel, intervalTime);
      }
    });