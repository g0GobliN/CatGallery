// Dynamic Cat Gallery with Load More functionality
// This script completely replaces local images with API images and adds infinite loading

document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';
    const IMAGES_PER_LOAD = 8; // How many images to load at once
    const LOADING_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPg==';
    
    let currentImageCount = 0;
    let isLoading = false;

    // Get the cats grid container
    const catsGrid = document.querySelector('.cats-grid');
    if (!catsGrid) {
        console.error('Cats grid container not found!');
        return;
    }

    // Clear existing images first
    catsGrid.innerHTML = '';

    // Function to fetch multiple cat images from API
    async function fetchCatImages(count = IMAGES_PER_LOAD) {
        try {
            const response = await fetch(`${CAT_API_URL}?limit=${count}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.map(cat => cat.url);
        } catch (error) {
            console.error('Error fetching cat images:', error);
            // Return fallback images if API fails
            return Array(count).fill(null).map((_, index) => 
                `https://placekitten.com/300/300?random=${Date.now()}-${index}`
            );
        }
    }
    
    // Function to update the image counter
    function updateImageCounter() {
        const counterDiv = document.getElementById('image-counter');
        if (counterDiv) {
            counterDiv.textContent = `Cats displayed: ${currentImageCount}`;
        }
    }

    // Function to create a cat item element
    function createCatItem(imageUrl, index) {
        const catItem = document.createElement('div');
        catItem.className = 'cat-item';
        
        const img = document.createElement('img');
        img.src = LOADING_PLACEHOLDER;
        img.alt = `Loading cat ${index}...`;
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in-out';
        
        // Create a new image to preload
        const preloadImg = new Image();
        preloadImg.onload = function() {
            img.src = imageUrl;
            img.alt = `Beautiful Cat ${index} from API`;
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        };
        
        preloadImg.onerror = function() {
            console.error(`Failed to load cat image ${index}`);
            img.src = `https://placekitten.com/300/300?fallback=${index}`;
            img.alt = `Cat ${index} (Fallback)`;
            img.style.opacity = '1';
        };
        
        preloadImg.src = imageUrl;
        catItem.appendChild(img);
        
        return catItem;
    }

    // Function to load and display cat images
    async function loadCatImages(count = IMAGES_PER_LOAD) {
        if (isLoading) return;
        
        isLoading = true;
        updateLoadMoreButton('Loading...', true);

        try {
            const imageUrls = await fetchCatImages(count);
            
            imageUrls.forEach((imageUrl, index) => {
                const catItem = createCatItem(imageUrl, currentImageCount + index + 1);
                catsGrid.appendChild(catItem);
                
                // Add a small delay for staggered animation
                setTimeout(() => {
                    catItem.style.transform = 'translateY(20px)';
                    catItem.style.opacity = '0';
                    catItem.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                    
                    requestAnimationFrame(() => {
                        catItem.style.transform = 'translateY(0)';
                        catItem.style.opacity = '1';
                    });
                }, index * 100);
            });
            
            currentImageCount += imageUrls.length;
            console.log(`Loaded ${imageUrls.length} new cat images. Total: ${currentImageCount}`);
            
        } catch (error) {
            console.error('Error loading cat images:', error);
        } finally {
            isLoading = false;
            updateLoadMoreButton('View More 🐱', false);
            updateImageCounter(); // <-- This is a critical addition
        }
    }

    // Function to create and manage the "Load More" button
    function createLoadMoreButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '30px';
        
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'load-more-btn';
        loadMoreBtn.textContent = 'View More Cats 🐱';
        loadMoreBtn.className = 'btn';
        loadMoreBtn.style.fontSize = '1.1rem';
        loadMoreBtn.style.padding = '15px 30px';
        loadMoreBtn.style.cursor = 'pointer';
        
        loadMoreBtn.addEventListener('click', function() {
            loadCatImages();
        });
        
        buttonContainer.appendChild(loadMoreBtn);
        catsGrid.parentNode.appendChild(buttonContainer);
        
        return loadMoreBtn;
    }

    // Function to update load more button state
    function updateLoadMoreButton(text, disabled) {
        const btn = document.getElementById('load-more-btn');
        if (btn) {
            btn.textContent = text;
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.6' : '1';
            btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
    }

    // Function to create refresh button
    function createRefreshButton() {
        const galleryContainer = catsGrid.parentNode;
        const sectionTitle = galleryContainer.querySelector('.section-title');
        
        if (sectionTitle) {
            const refreshBtn = document.createElement('button');
            refreshBtn.textContent = '🔄 Refresh Gallery';
            refreshBtn.className = 'btn';
            refreshBtn.style.display = 'block';
            refreshBtn.style.margin = '20px auto';
            refreshBtn.style.backgroundColor = '#e74c3c';
            refreshBtn.style.cursor = 'pointer';
            
            refreshBtn.addEventListener('click', function() {
                if (isLoading) return;
                
                refreshBtn.disabled = true;
                refreshBtn.textContent = 'Refreshing...';
                
                // Clear current images
                catsGrid.innerHTML = '';
                currentImageCount = 0;
                updateImageCounter(); // <-- Also here
                
                // Load fresh images
                loadCatImages().then(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = '🔄 Refresh Gallery';
                });
            });
            
            sectionTitle.insertAdjacentElement('afterend', refreshBtn);
        }
    }

    // Function to add infinite scroll (optional)
    function addInfiniteScroll() {
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                
                // If user scrolled to bottom 200px before the end
                if (scrollTop + windowHeight >= documentHeight - 200) {
                    if (!isLoading && currentImageCount > 0) {
                        console.log('Auto-loading more cats due to scroll...');
                        loadCatImages();
                    }
                }
            }, 100);
        });
    }

    // Function to add image counter
    function createImageCounter() {
        const counterDiv = document.createElement('div');
        counterDiv.id = 'image-counter';
        counterDiv.style.textAlign = 'center';
        counterDiv.style.marginBottom = '20px';
        counterDiv.style.fontSize = '1.1rem';
        counterDiv.style.color = '#666';
        counterDiv.textContent = `Cats displayed: ${currentImageCount}`;
        
        const galleryContainer = catsGrid.parentNode;
        galleryContainer.insertBefore(counterDiv, catsGrid);
    }
    
    // Initialize the gallery
    async function initializeGallery() {
        console.log('Initializing cat gallery with API images...');
        
        // Create UI elements
        createRefreshButton();
        createImageCounter();
        createLoadMoreButton();
        
        // Load initial images
        await loadCatImages();
        
        // Enable infinite scroll (optional - uncomment if you want it)
        // addInfiniteScroll();
        
        console.log('Cat gallery initialized successfully!');
    }

    // Start the gallery
    initializeGallery();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Press 'L' to load more cats
        if (event.key.toLowerCase() === 'l' && !event.ctrlKey && !event.altKey) {
            if (!isLoading) {
                loadCatImages();
            }
        }
        
        // Press 'R' to refresh gallery
        if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.altKey) {
            location.reload();
        }
    });

    // Expose functions globally for debugging
    window.catGallery = {
        loadMore: () => loadCatImages(),
        refresh: () => location.reload(),
        getCount: () => currentImageCount,
        isLoading: () => isLoading
    };
});