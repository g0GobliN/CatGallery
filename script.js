// Mobile navigation
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');
const body = document.body;

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    body.classList.toggle('nav-open');
}

// Close mobile menu
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    body.classList.remove('nav-open');
}

// Event listeners for mobile menu - Fixed to prevent conflicts
hamburger.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event bubbling
    toggleMobileMenu();
});

// Close menu on overlay click
navOverlay.addEventListener('click', function(e) {
    e.stopPropagation();
    closeMobileMenu();
});

// Close menu on link click
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        // Don't prevent default for anchor links
        closeMobileMenu();
    });
});

// Close menu on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Close menu when clicking outside - Fixed logic
document.addEventListener('click', function(e) {
    const isMenuOpen = navMenu.classList.contains('active');
    const clickedHamburger = hamburger.contains(e.target);
    const clickedMenu = navMenu.contains(e.target);
    
    if (isMenuOpen && !clickedHamburger && !clickedMenu) {
        closeMobileMenu();
    }
});

// Cat API functionality
const catsGrid = document.getElementById('cats-grid');
const loadCatsBtn = document.getElementById('load-cats');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.getElementById('closeModal');

let isLoading = false;

async function loadCats() {
    if (isLoading) return;
    
    isLoading = true;
    loadCatsBtn.disabled = true;
    loadCatsBtn.textContent = 'Loading...';
    
    // Remove any existing loading or error messages
    const loadingDiv = document.querySelector('.loading');
    const errorDiv = document.querySelector('.error-message');
    if (loadingDiv) loadingDiv.remove();
    if (errorDiv) errorDiv.remove();

    try {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=20');

        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cats = await response.json();
        
        if (!cats || cats.length === 0) {
            throw new Error('No cats received from API');
        }

        cats.forEach(cat => {
            const img = document.createElement('img');
            img.src = cat.url;
            img.alt = '美しい猫の写真';
            img.className = 'cat-image';
            img.loading = 'lazy';
            
            // Add click event listener for modal
            img.addEventListener('click', function(e) {
                e.preventDefault();
                modal.style.display = 'block';
                modalImg.src = img.src;
                body.style.overflow = 'hidden';
            });
            
            // Handle image load errors
            img.addEventListener('error', function() {
                img.style.display = 'none';
                console.warn('Failed to load cat image:', cat.url);
            });
            
            catsGrid.appendChild(img);
        });
        
    } catch (error) {
        console.error('Failed to load cats:', error);
        
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'loading error-message';
        errorDiv.textContent = '猫の読み込みに失敗しました。もう一度お試しください。';
        catsGrid.appendChild(errorDiv);
    } finally {
        isLoading = false;
        loadCatsBtn.disabled = false;
        loadCatsBtn.textContent = 'View More Cats';
    }
}

// Load initial cats
loadCats();

// Load more cats button
loadCatsBtn.addEventListener('click', loadCats);

// Modal functionality - Fixed to prevent conflicts
function closeModalHandler(e) {
    if (e) e.stopPropagation();
    modal.style.display = 'none';
    body.style.overflow = '';
}

// Close modal events
closeModal.addEventListener('click', closeModalHandler);

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModalHandler(e);
    }
});

// Close modal with escape key - Fixed to not conflict with menu
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (modal.style.display === 'block') {
            closeModalHandler();
        } else if (navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle orientation change on mobile
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        if (navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});