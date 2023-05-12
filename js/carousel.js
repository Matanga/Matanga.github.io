class Carousel {
  constructor(parentID, images) {

      const carouselParent = document.getElementById(parentID);
      if (!carouselParent) {
          console.error(`Element with ID "${parentID}" not found`);
          return;
      }
      //delete previous carousel if it exists
      carouselParent.innerHTML= "";

      if(images.length ==0){
          console.error(`No Images to add`);
          return; 
      }

      //Options
      this.auto = true; // Auto scroll
      this.intervalTime = 5000;
      this.sliderInterval = null;


      this.addCarouselHTML(carouselParent,'customID');
      this.addImagesToCarousel(images,this.carousel);
      this.initCarousel();
  }

  addCarouselHTML(element, otherID) {

    element.innerHTML="";

    this.imagesCarousel = document.createElement("div");
    this.imagesCarousel.setAttribute("id", "images-carousel");

    const imgCarouselContainer = document.createElement("div");
    imgCarouselContainer.setAttribute("class", "img-carousel-container");

    this.carousel = document.createElement("div");
    this.carousel.setAttribute("class", "img-carousel");
    this.carousel.setAttribute("id", otherID);

    this.prevBtn = document.createElement("button");
    this.prevBtn.setAttribute("id", "prev");
    this.prevBtn.textContent = "prev";

    this.nextBtn = document.createElement("button");
    this.nextBtn.setAttribute("id", "next");
    this.nextBtn.textContent = "next";

    imgCarouselContainer.appendChild(this.carousel);
    imgCarouselContainer.appendChild(this.prevBtn);
    imgCarouselContainer.appendChild(this.nextBtn);

    this.imagesCarousel.appendChild(imgCarouselContainer);

    element.appendChild(this.imagesCarousel);
  }

  addImagesToCarousel(images, container) {

    // Loop through the images and create a new div with an image element child for each one
    images.forEach(imagePath => {
      const div = document.createElement("div");
      const img = document.createElement("img");
      img.setAttribute("src", ("https://matanga.github.io/images/"+imagePath));
      div.appendChild(img);
      container.appendChild(div);
    /*
      // Used With the modal system
      var modal = document.getElementById("modalWindow");
      var modalImg = document.getElementById("modalImage");
      var captionText = document.getElementById("caption");

      img.onclick = function(){
      modal.style.display = "block";
      modalImg.src = this.src;
      captionText.innerHTML = this.alt;
    }

*/

    });
  }

  initCarousel() {
    this.nextBtn.addEventListener('click', this.nextCarousel.bind(this));
    this.prevBtn.addEventListener('click', this.prevCarousel.bind(this));

    if (this.auto) {
      this.sliderInterval = setInterval(this.nextCarousel.bind(this), this.intervalTime);
    }

    this.carousel.addEventListener('mouseover', () => {
      clearInterval(this.sliderInterval);
    });

    this.carousel.addEventListener('mouseleave', () => {
      if (this.auto) {
        this.sliderInterval = setInterval(this.nextCarousel.bind(this), this.intervalTime);
      }
    });

    this.carousel.addEventListener('touchstart', () => {
      clearInterval(this.sliderInterval);
    });

    this.carousel.addEventListener('touchend', () => {
      if (this.auto) {
        this.sliderInterval = setInterval(this.nextCarousel.bind(this), this.intervalTime);
      }
    });
  }

  nextCarousel() {
    const scrollWidth = this.carousel.scrollWidth;
    const scrollPos = this.carousel.scrollLeft;
    const containerWidth = this.carousel.clientWidth;
    const itemWidth = this.carousel.firstElementChild.clientWidth;
    const itemsInView = Math.round(containerWidth / itemWidth);
    const itemsToScroll = itemsInView === 1 ? 1 : itemsInView - 1;
    const distanceToNext = itemWidth * itemsToScroll;

    if (scrollWidth - scrollPos === containerWidth) {
      this.carousel.scrollTo(0, 0);
    } else {
      this.carousel.scrollBy(distanceToNext, 0);
    }
  }

  prevCarousel() {
    const scrollWidth = this.carousel.scrollWidth;
    const scrollPos = this.carousel.scrollLeft;
    const containerWidth = this.carousel.clientWidth;
    const itemWidth = this.carousel.firstElementChild.clientWidth;
    const itemsInView = Math.round(containerWidth / itemWidth);
    const itemsToScroll = itemsInView === 1 ? 1 : itemsInView - 1;
    const distanceToPrev = itemWidth * itemsToScroll;

    if (scrollPos === 0) {
      this.carousel.scrollTo(scrollWidth, 0);
    } else {
      this.carousel.scrollBy(-distanceToPrev, 0);
    }
  }
}