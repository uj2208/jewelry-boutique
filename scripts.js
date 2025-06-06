// Cart Management with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

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
    try {
        const item = cart.find(item => item.id === id);
        const card = document.querySelector(`.product-card[data-id="${id}"]`);
        const size = card ? card.querySelector('.size-dropdown').value : (item ? item.size : 'M');
        if (item) {
            item.quantity += change;
            item.size = size;
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem.id !== id);
            }
        } else if (change > 0) {
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            cart.push({ id, name, price, size, quantity: 1 });
        }
        if (quantitySpan && decreaseBtn) {
            const newQuantity = parseInt(quantitySpan.textContent) + change;
            if (newQuantity >= 0) {
                quantitySpan.textContent = newQuantity;
                decreaseBtn.disabled = newQuantity === 0;
            }
        }
        updateCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
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

// Modal Functionality
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

// Product Card Quantity Controls
function setupProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        const increaseBtn = card.querySelector('.increase');
        const decreaseBtn = card.querySelector('.decrease');
        const quantitySpan = card.querySelector('.quantity');

        if (!increaseBtn || !decreaseBtn || !quantitySpan) {
            console.error('Quantity control elements not found in product card');
            return;
        }

        decreaseBtn.disabled = true;

        increaseBtn.addEventListener('click', function() {
            try {
                const id = card.dataset.id;
                updateQuantity(id, 1, quantitySpan, decreaseBtn);
                const name = card.dataset.name;
                alert(`${name} added to cart!`);
            } catch (error) {
                console.error('Error increasing quantity:', error);
            }
        });

        decreaseBtn.addEventListener('click', function() {
            try {
                const id = card.dataset.id;
                const currentQuantity = parseInt(quantitySpan.textContent);
                if (currentQuantity > 0) {
                    updateQuantity(id, -1, quantitySpan, decreaseBtn);
                }
            } catch (error) {
                console.error('Error decreasing quantity:', error);
            }
        });
    });
}

// Cart Page Specific Functionality
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
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                } else {
                    alert('Proceeding to checkout...');
                    cart = [];
                    updateCart();
                    document.querySelectorAll('.product-card').forEach(card => {
                        const quantitySpan = card.querySelector('.quantity');
                        const decreaseBtn = card.querySelector('.decrease');
                        if (quantitySpan && decreaseBtn) {
                            quantitySpan.textContent = '0';
                            decreaseBtn.disabled = true;
                        }
                    });
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

// Initialize Page-Specific Features
document.addEventListener('DOMContentLoaded', () => {
    setupShareButton();
    setupModal();
    setupProductCards();
    setupCartPage();
    setupContactForm();
    setupSlideshow();
    setupHeroVideo();
    setupImageReveal();
});
