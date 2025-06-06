// Cart Management with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    console.log('Updating cart table with cart:', cart);
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>$${item.price}</td>
            <td>
                <div class="cart-quantity-control">
                    <button class="cart-decrease" data-id="${item.id}">−</button>
                    <span>${item.quantity}</span>
                    <button class="cart-increase" data-id="${item.id}">+</button>
                </div>
            </td>
            <td>$${item.price * item.quantity}</td>
        `;
        cartItems.appendChild(row);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    saveCart();
}

function updateQuantity(id, change, quantitySpan, decreaseBtn) {
    console.log(`updateQuantity called with id: ${id}, change: ${change}`);
    console.log('Cart before update:', cart);
    try {
        const item = cart.find(item => item.id === id);
        const card = document.querySelector(`.product-card[data-id="${id}"]`);
        const size = card ? card.querySelector('.size-dropdown').value : (item ? item.size : 'M');
        let newQuantity;
        let isNewItem = false;

        if (item) {
            item.quantity += change;
            item.size = size;
            newQuantity = item.quantity;
            console.log(`Item quantity updated to: ${newQuantity}`);
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem.id !== id);
                newQuantity = 0;
                console.log('Item removed from cart');
            }
        } else if (change > 0) {
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            cart.push({ id, name, price, size, quantity: 1 });
            newQuantity = 1;
            isNewItem = true;
            console.log(`New item added to cart: ${name}, Quantity: 1`);
        } else {
            newQuantity = 0;
            console.log('No item found and change <= 0, setting quantity to 0');
        }

        if (quantitySpan && decreaseBtn) {
            quantitySpan.textContent = newQuantity;
            decreaseBtn.disabled = newQuantity === 0;
            console.log(`UI updated - Quantity span set to: ${quantitySpan.textContent}, Decrease button disabled: ${decreaseBtn.disabled}`);

            // Trigger cart animation if a new item is added
            if (isNewItem && card) {
                const productImage = card.querySelector('.product-image');
                const cartLink = document.querySelector('.nav-links a[href="cart.html"]');
                if (productImage && cartLink) {
                    const imgClone = productImage.cloneNode(true);
                    imgClone.classList.add('cart-animation');
                    document.body.appendChild(imgClone);

                    // Get positions for animation
                    const cardRect = card.getBoundingClientRect();
                    const endRect = cartLink.getBoundingClientRect();

                    // Start position: Center above the product card
                    const cloneWidth = imgClone.width;
                    const cloneHeight = imgClone.height;
                    const startX = cardRect.left + (cardRect.width / 2) - (cloneWidth / 2);
                    const startY = cardRect.top + window.scrollY - cloneHeight - 10;

                    imgClone.style.left = `${startX}px`;
                    imgClone.style.top = `${startY}px`;

                    // Calculate the final position (center of the cart link)
                    const endX = endRect.left + (endRect.width / 2) - (cloneWidth / 2);
                    const endY = endRect.top + window.scrollY + (endRect.height / 2) - (cloneHeight / 2);

                    // Animate to the cart link
                    requestAnimationFrame(() => {
                        imgClone.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
                    });

                    imgClone.addEventListener('animationend', () => {
                        imgClone.remove();
                    });
                }
            }
        }

        console.log('Cart after update:', cart);
        saveCart();
        updateCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Generate a random order number (e.g., ORDER-123456)
function generateOrderNumber() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `ORDER-${randomNum}`;
}

// Format cart details for WhatsApp message
function formatOrderDetails(orderNumber, location) {
    let message = `New Order: ${orderNumber}\n\n`;
    message += `Customer Location: ${location}\n\n`;
    message += "Order Details:\n";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `- ${item.name} (Size: ${item.size}, Quantity: ${item.quantity}) - $${itemTotal}\n`;
    });

    message += `\nTotal: $${total.toFixed(2)}\n`;
    message += `\nThank you for shopping with Nitya Chikankari!`;

    // Encode message for URL
    return encodeURIComponent(message);
}

// Sync quantities with cart state on page load
function syncQuantities() {
    console.log('Syncing quantities on page load');
    document.querySelectorAll('.product-card').forEach(card => {
        const id = card.dataset.id;
        const quantitySpan = card.querySelector('.quantity');
        const decreaseBtn = card.querySelector('.decrease');
        const item = cart.find(item => item.id === id);
        if (item && quantitySpan && decreaseBtn) {
            quantitySpan.textContent = item.quantity;
            quantitySpan.offsetHeight;
            decreaseBtn.disabled = item.quantity === 0;
            console.log(`Synced quantity for id ${id}: ${item.quantity}`);
        }
    });
}

// Share Button Functionality
function setupShareButton() {
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            try {
                const pageUrl = window.location.href;
                navigator.clipboard.writeText(pageUrl).then(() => {
                    alert('Link copied to clipboard! Share it with a friend.');
                }).catch(err => {
                    console.error('Failed to copy link:', err);
                    alert('Failed to copy link. Please copy the URL manually: ' + pageUrl);
                });
            } catch (error) {
                console.error('Error sharing page:', error);
            }
        });
    }
}

// Modal Functionality for Product Details
function setupModal() {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');
    const modalClose = document.querySelector('.modal-close');

    if (modal && modalTitle && modalGrid && modalClose) {
        document.querySelectorAll('.eye-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.parentElement;
                const images = JSON.parse(card.dataset.images);
                const details = JSON.parse(card.dataset.details);
                const price = card.dataset.price;
                const sizes = card.dataset.sizes;
                const name = card.querySelector('h3').textContent;

                modalTitle.textContent = name;
                modalGrid.innerHTML = '';
                images.forEach(imgSrc => {
                    const modalCard = document.createElement('div');
                    modalCard.classList.add('modal-card');
                    modalCard.innerHTML = `
                        <img src="${imgSrc}" alt="${name}" loading="lazy">
                        <p><strong>Material:</strong> ${details.material}</p>
                        <p><strong>Color:</strong> ${details.color}</p>
                        <p><strong>Craft:</strong> ${details.craft}</p>
                        <p class="modal-price">$${price}</p>
                        <p class="modal-sizes"><strong>Sizes:</strong> ${sizes}</p>
                    `;
                    modalGrid.appendChild(modalCard);
                });

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.click();
            }, { passive: false });
        });

        modalClose.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Close button clicked');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        modalClose.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button touched');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });

        modalClose.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button touch ended');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Clicked outside modal');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Image Zoom Functionality
function setupImageZoom() {
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');
    const zoomClose = document.querySelector('.zoom-close');

    if (zoomOverlay && zoomedImage && zoomClose) {
        document.querySelectorAll('.zoomable').forEach(img => {
            img.addEventListener('click', () => {
                console.log('Image clicked for zoom:', img.src);
                zoomedImage.src = img.src;
                zoomedImage.alt = img.alt;
                zoomOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        zoomClose.addEventListener('click', () => {
            console.log('Zoom close button clicked');
            zoomOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay) {
                console.log('Clicked outside zoomed image');
                zoomOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        zoomClose.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Zoom close button touched');
            zoomOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });
    }
}

// Product Card Quantity Controls
function setupProductCards() {
    console.log(`Found ${document.querySelectorAll('.product-card').length} product cards`);
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const increaseBtn = card.querySelector('.increase');
        const decreaseBtn = card.querySelector('.decrease');
        let quantitySpan = card.querySelector('.quantity');

        console.log('Increase button:', increaseBtn);
        console.log('Decrease button:', decreaseBtn);
        console.log('Quantity span:', quantitySpan);

        if (!increaseBtn || !decreaseBtn || !quantitySpan) {
            console.error('Quantity control elements not found in product card');
            return;
        }

        increaseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Increase button clicked');
            try {
                const id = card.dataset.id;
                quantitySpan = card.querySelector('.quantity');
                updateQuantity(id, 1, quantitySpan, decreaseBtn);
                const name = card.dataset.name;
                alert(`${name} added to cart!`);
            } catch (error) {
                console.error('Error increasing quantity:', error);
            }
        });

        decreaseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Decrease button clicked');
            try {
                const id = card.dataset.id;
                quantitySpan = card.querySelector('.quantity');
                const currentQuantity = parseInt(quantitySpan.textContent);
                if (currentQuantity > 0) {
                    updateQuantity(id, -1, quantitySpan, decreaseBtn);
                }
            } catch (error) {
                console.error('Error decreasing quantity:', error);
            }
        });
    });

    document.addEventListener('click', (e) => {
        console.log('Click event captured on:', e.target);
    });
}

// Cart Page Specific Functionality with Checkout
function setupCartPage() {
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        updateCart();
        cartItems.addEventListener('click', function(e) {
            const target = e.target;
            if (target.classList.contains('cart-increase') || target.classList.contains('cart-decrease')) {
                const id = target.dataset.id;
                const change = target.classList.contains('cart-increase') ? 1 : -1;
                const item = cart.find(item => item.id === id);
                if (item || change > 0) {
                    const quantitySpan = document.querySelector(`.product-card[data-id="${id}"] .quantity`);
                    const decreaseBtn = document.querySelector(`.product-card[data-id="${id}"] .decrease`);
                    updateQuantity(id, change, quantitySpan, decreaseBtn);
                }
            }
        });

        const checkoutBtn = document.querySelector('.checkout-btn');
        const locationModal = document.getElementById('location-modal');
        const locationInput = document.getElementById('location-input');
        const submitLocationBtn = document.getElementById('submit-location');
        const locationModalClose = document.querySelector('.location-modal-close');

        if (checkoutBtn && locationModal && locationInput && submitLocationBtn && locationModalClose) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                } else {
                    // Show location modal
                    locationModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    locationInput.value = ''; // Clear previous input
                }
            });

            submitLocationBtn.addEventListener('click', function() {
                const location = locationInput.value.trim();
                if (!location) {
                    alert('Please enter your location.');
                    return;
                }

                // Generate order number and format message
                const orderNumber = generateOrderNumber();
                const message = formatOrderDetails(orderNumber, location);

                // Redirect to WhatsApp
                const whatsappNumber = '+7007992535';
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');

                // Clear cart and update UI
                cart = [];
                updateCart();
                document.querySelectorAll('.product-card').forEach(card => {
                    const quantitySpan = card.querySelector('.quantity');
                    const decreaseBtn = card.querySelector('.decrease');
                    if (quantitySpan && decreaseBtn) {
                        quantitySpan.textContent = '0';
                        quantitySpan.offsetHeight;
                        decreaseBtn.disabled = true;
                    }
                });

                // Close location modal
                locationModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            locationModalClose.addEventListener('click', () => {
                locationModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            locationModal.addEventListener('click', (e) => {
                if (e.target === locationModal) {
                    locationModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
}

// Contact Form Submission
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
}

// Theme Slideshow for Collections Page
function setupSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    if (slides.length > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 4000);
    }
}

// Hero Video on Home Page
function setupHeroVideo() {
    const video = document.getElementById('hero-video');
    const shopNowBtn = document.getElementById('shop-now-btn');
    if (video && shopNowBtn) {
        video.addEventListener('ended', () => {
            console.log('Hero video ended, enabling loop');
            shopNowBtn.style.display = 'inline-block';
            shopNowBtn.classList.add('fade-in');
            video.loop = true;
            video.play().catch(e => console.error('Video replay error:', e));
        });
        video.addEventListener('play', () => console.log('Hero video started playing'));
        video.addEventListener('error', (e) => console.error('Video error:', e));
    }
}

// Image Reveal on Scroll
function setupImageReveal() {
    const revealImages = document.querySelectorAll('.product-card .product-image');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealImages.forEach(img => {
        img.style.opacity = 0;
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(img);
    });
}

// Ensure DOM is fully loaded before initializing
function initialize() {
    console.log('Initializing scripts');
    setupShareButton();
    setupModal();
    setupImageZoom();
    setupProductCards();
    syncQuantities();
    setupCartPage();
    setupContactForm();
    setupSlideshow();
    setupHeroVideo();
    setupImageReveal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}