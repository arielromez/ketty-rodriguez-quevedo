const year = document.getElementById("year")
if (year) {
    const thisYear = new Date().getFullYear()
    year.setAttribute("datatime", thisYear)
    year.textContent = thisYear
}

// IMAGE MODAL ON CLICK
document.addEventListener('DOMContentLoaded', function() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.innerHTML = `
                <span class="modal-close" aria-label="Cerrar imagen">Close</span>
                <button class="modal-nav modal-prev" aria-label="Previous image">Back</button>
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
        
        // Source - use fullsize version if available, otherwise use original src
        const fullsizeUrl = img.getAttribute('data-fullsize');
        modalImg.src = fullsizeUrl || img.src;
        
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
            console.log('Clicked element:', el.tagnav, el.classnav || '(no class)', el);
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

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        }
    });
});

// HEADER HIDE/SHOW ON SCROLL
let lastScrollTop = 0;
const header = document.querySelector('header');
let scrollThreshold = 100; // Minimum scroll distance before hiding

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    }
}, false);
