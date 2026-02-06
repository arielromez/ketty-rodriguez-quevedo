const year = document.getElementById("year");
if (year) {
    const thisYear = new Date().getFullYear();
    year.setAttribute("datatime", thisYear);
    year.textContent = thisYear;
}

// IMAGE MODAL ON CLICK
document.addEventListener('DOMContentLoaded', function() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.innerHTML = `
                <span class="modal-close" aria-label="Cerrar imagen">Close</span>
                <button class="modal-nav modal-prev" aria-label="Previous image">Previous</button>
                <button class="modal-nav modal-next" aria-label="Next image">Next</button>
                <figure class="modal-figure">
                    <img src="" alt="" id="modalImage">
                    <figcaption class="modal-caption" aria-live="polite"></figcaption>
                </figure>`;
    document.body.appendChild(modal);

    // Get all images to zoom
    const images = document.querySelectorAll('.art-thumbnail img');
    let currentIndex = 0;
    
    // Function to show image at index
    function showImage(index) {
        const img = images[index];
        const modalImg = document.getElementById('modalImage');
        const captionBox = document.querySelector('#imageModal .modal-caption');
        
        // Source - use src directly since we now use fullsize images only
        modalImg.src = img.src;
        
        // Caption priority: figure figcaption > title attr > alt attr > empty
        const fig = img.closest('figure');
        const figcap = fig ? fig.querySelector('figcaption') : null;
        const rawCaption = figcap && figcap.textContent.trim() ? figcap.textContent.trim() : (img.getAttribute('title') || img.getAttribute('alt') || '');
        captionBox.textContent = rawCaption;
        
        if (!rawCaption) {
            captionBox.style.display = 'none';
            captionBox.setAttribute('aria-hidden','true');
        } else {
            captionBox.style.display = 'block';
            captionBox.removeAttribute('aria-hidden');
        }
        
        // Alt text mirrors caption for accessibility fallback
        modalImg.alt = rawCaption || 'Imagen ampliada';
        currentIndex = index;
    }
    
    // Add click handler
    images.forEach((img, index) => {
        img.onclick = function(e) {
            showImage(index);
            modal.classList.add('active');
        };
    });

    // Navigation buttons
    document.querySelector('.modal-prev').onclick = function() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    };
    
    document.querySelector('.modal-next').onclick = function() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    };

    // Global click logger: briefly outline the clicked element to help debug overlays
    document.addEventListener('click', function(e) {
        try {
            const el = e.target;
            el.classList.add('debug-clicked');
            setTimeout(() => el.classList.remove('debug-clicked'), 700);
            console.log('Clicked element:', el.tagName, el.className || '(no class)', el);
        } catch (err) {
            console.error('Debug click handler error', err);
        }
    }, true); // use capture to log early

    // Close modal
    document.querySelector('.modal-close').onclick = function() {
        modal.classList.remove('active');
    };

    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };

    // Close with Escape key and navigate with arrow keys
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        } else if (modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            }
        }
    });
});

// HEADER SCROLL BEHAVIOR
(function() {
    let lastScrollTop = 0;
    let ticking = false;
    const header = document.querySelector('header');
    
    if (!header) return;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            // User has scrolled - move header to top
            header.classList.add('scrolled');
        } else {
            // At top of page - header at center
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
})();

// LAZY LOADING FOR ART THUMBNAILS
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('.art-thumbnail img[data-src]');
    console.log('Found', lazyImages.length, 'images for lazy loading');
    
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    console.log('Loading image:', img.dataset.src);
                    img.classList.add('loading');
                    
                    // Load the image
                    const actualSrc = img.dataset.src;
                    img.src = actualSrc;
                    
                    img.onload = function() {
                        console.log('Image loaded successfully:', actualSrc);
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    };
                    
                    img.onerror = function() {
                        console.error('Failed to load image:', actualSrc);
                        img.classList.remove('loading');
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, {
            // Load images when they're 50px away from viewport
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
            console.log('Observing image:', img.dataset.src);
        });
        
        console.log('Lazy loading initialized successfully');
    } else if (lazyImages.length > 0) {
        // Fallback for browsers without IntersectionObserver
        console.log('IntersectionObserver not supported, loading all images immediately');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        });
    } else {
        console.log('No images found with data-src attributes');
    }
});

// COVER IMAGE CAROUSEL
document.addEventListener('DOMContentLoaded', function() {
    const carouselImages = document.querySelectorAll('.car-cover-img .carousel-img');
    console.log('Carousel images found:', carouselImages.length);
    
    if (carouselImages.length > 1) {
        let currentSlide = 0;
        
        function nextSlide() {
            console.log('Transitioning from slide', currentSlide, 'to', (currentSlide + 1) % carouselImages.length);
            carouselImages[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % carouselImages.length;
            carouselImages[currentSlide].classList.add('active');
        }
        
        // Change image every 4 seconds
        setInterval(nextSlide, 4000);
        console.log('Carousel initialized with', carouselImages.length, 'images');
    } else {
        console.log('Carousel not initialized - need at least 2 images');
    }
});
