// ===========================
// AURAVE - Event Handlers & Form Logic
// "Luxury Fashion for Every Aura"
//
// This file contains all event handlers and form logic for the AURAVE application.
// It handles user interactions, form submissions, product interactions, and cart operations.
//
// Author: AURAVE Development Team
// Version: 1.0
// Last Updated: 2025
// ===========================

// ===========================
// EVENT HANDLERS
// Main event handling object containing all event listener functions
// ===========================
const EventHandlers = {
  // Navigation events
  initNavigation: function() {
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = Utils.select(`#${targetId}`);
        if (targetElement) {
          UIFunctions.smoothScrollTo(targetElement);
        }
      }
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      const sections = Utils.selectAll('section[id]');
      const navLinks = Utils.selectAll('.nav-link[href^="#"]');
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, 100));
  },

  // Form events
  initForms: function() {
    // Contact form
    const contactForm = Utils.select('#contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleContactForm);
    }

    // Newsletter form
    const newsletterForm = Utils.select('#newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', this.handleNewsletterForm);
    }

    // Search form
    const searchForm = Utils.select('#search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', this.handleSearchForm);
    }

    // Login form
    const loginForm = Utils.select('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLoginForm);
    }

    // Register form
    const registerForm = Utils.select('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', this.handleRegisterForm);
    }

    // Review form
    const reviewForm = Utils.select('#review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', this.handleReviewForm);
    }
  },

  // Product events
  initProducts: function() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const button = e.target.closest('.add-to-cart-btn');
        const productId = button.dataset.productId;
        const quantity = parseInt(button.dataset.quantity) || 1;
        this.handleAddToCart(productId, quantity, button);
      }
    });

    // Quantity controls
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quantity-btn')) {
        e.preventDefault();
        const button = e.target.closest('.quantity-btn');
        const action = button.dataset.action;
        const input = button.parentElement.querySelector('.quantity-input');
        if (input) {
          let value = parseInt(input.value) || 1;
          if (action === 'increase') {
            value++;
          } else if (action === 'decrease' && value > 1) {
            value--;
          }
          input.value = value;
          
          // Trigger change event
          input.dispatchEvent(new Event('change'));
        }
      }
    });

    // Product image zoom
    document.addEventListener('click', (e) => {
      if (e.target.closest('.product-image')) {
        const img = e.target.closest('.product-image');
        this.handleImageZoom(img);
      }
    });

    // Wishlist toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wishlist-btn')) {
        e.preventDefault();
        const button = e.target.closest('.wishlist-btn');
        const productId = button.dataset.productId;
        this.handleWishlistToggle(productId, button);
      }
    });

    // Product size selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.size-btn')) {
        e.preventDefault();
        const button = e.target.closest('.size-btn');
        const size = button.dataset.size;
        this.handleSizeSelection(size, button);
      }
    });

    // Product color selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.color-btn')) {
        e.preventDefault();
        const button = e.target.closest('.color-btn');
        const color = button.dataset.color;
        this.handleColorSelection(color, button);
      }
    });
  },

  // Cart events
  initCart: function() {
    // Remove from cart
    document.addEventListener('click', (e) => {
      if (e.target.closest('.remove-from-cart')) {
        e.preventDefault();
        const button = e.target.closest('.remove-from-cart');
        const productId = button.dataset.productId;
        this.handleRemoveFromCart(productId);
      }
    });

    // Update cart quantity
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('cart-quantity-input')) {
        const productId = e.target.dataset.productId;
        const quantity = parseInt(e.target.value) || 1;
        this.handleUpdateCartQuantity(productId, quantity);
      }
    });

    // Clear cart
    document.addEventListener('click', (e) => {
      if (e.target.closest('.clear-cart-btn')) {
        e.preventDefault();
        this.handleClearCart();
      }
    });

    // Proceed to checkout
    document.addEventListener('click', (e) => {
      if (e.target.closest('.checkout-btn')) {
        e.preventDefault();
        this.handleCheckout();
      }
    });
  },

  // Filter and sort events
  initFilters: function() {
    // Category filters
    document.addEventListener('click', (e) => {
      if (e.target.closest('.category-filter')) {
        e.preventDefault();
        const filter = e.target.closest('.category-filter');
        const category = filter.dataset.category;
        this.handleCategoryFilter(category);
      }
    });

    // Price range filter
    const priceRange = Utils.select('#price-range');
    if (priceRange) {
      priceRange.addEventListener('input', Utils.debounce((e) => {
        this.handlePriceFilter(e.target.value);
      }, 300));
    }

    // Sort dropdown
    const sortSelect = Utils.select('#sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.handleSort(e.target.value);
      });
    }

    // Search input
    const searchInput = Utils.select('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Clear filters
    document.addEventListener('click', (e) => {
      if (e.target.closest('.clear-filters-btn')) {
        e.preventDefault();
        this.handleClearFilters();
      }
    });
  },

  // Window events
  initWindowEvents: function() {
    // Before unload
    window.addEventListener('beforeunload', () => {
      // Save cart and user data
      Utils.storage.set('aurave_cart', AURAVE.cart);
      if (AURAVE.user) {
        Utils.storage.set('aurave_user', AURAVE.user);
      }
      Utils.storage.set('aurave_wishlist', AURAVE.wishlist);
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Utils.log('Page hidden', 'info');
      } else {
        Utils.log('Page visible', 'info');
      }
    });
  }
};

// Event Handler Functions
EventHandlers.handleContactForm = function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate form
  if (!data.name || !data.email || !data.message) {
    Utils.showNotification('Please fill in all required fields', 'warning');
    return;
  }

  if (!Utils.validateEmail(data.email)) {
    Utils.showNotification('Please enter a valid email address', 'warning');
    return;
  }

  // Show loading
  UIFunctions.showLoading();
  
  // Simulate API call
  setTimeout(() => {
    UIFunctions.hideLoading();
    Utils.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    e.target.reset();
  }, 2000);
};

EventHandlers.handleNewsletterForm = function(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  
  if (!Utils.validateEmail(email)) {
    Utils.showNotification('Please enter a valid email address', 'warning');
    return;
  }

  Utils.showNotification('Thank you for subscribing to our newsletter!', 'success');
  e.target.reset();
};

EventHandlers.handleSearchForm = function(e) {
  e.preventDefault();
  const query = e.target.querySelector('input[type="search"]').value.trim();
  
  if (query.length < 2) {
    Utils.showNotification('Please enter at least 2 characters to search', 'warning');
    return;
  }

  // Redirect to shop page with search query
  window.location.href = `pages/shop.html?search=${encodeURIComponent(query)}`;
};

EventHandlers.handleLoginForm = function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate form
  if (!data.email || !data.password) {
    Utils.showNotification('Please fill in all required fields', 'warning');
    return;
  }

  if (!Utils.validateEmail(data.email)) {
    Utils.showNotification('Please enter a valid email address', 'warning');
    return;
  }

  // Use Auth module if available
  if (typeof Auth !== 'undefined' && Auth.login) {
    Auth.login(data.email, data.password);
  } else {
    // Simulate login
    UIFunctions.showLoading();
    setTimeout(() => {
      UIFunctions.hideLoading();
      Utils.showNotification('Login successful!', 'success');
      UIFunctions.hideModal('#loginModal');
      e.target.reset();
    }, 1500);
  }
};

EventHandlers.handleRegisterForm = function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate form
  if (!data.name || !data.email || !data.password || !data.confirmPassword) {
    Utils.showNotification('Please fill in all required fields', 'warning');
    return;
  }

  if (!Utils.validateEmail(data.email)) {
    Utils.showNotification('Please enter a valid email address', 'warning');
    return;
  }

  if (data.password !== data.confirmPassword) {
    Utils.showNotification('Passwords do not match', 'warning');
    return;
  }

  if (data.password.length < 6) {
    Utils.showNotification('Password must be at least 6 characters long', 'warning');
    return;
  }

  // Use Auth module if available
  if (typeof Auth !== 'undefined' && Auth.register) {
    Auth.register(data);
  } else {
    // Simulate registration
    UIFunctions.showLoading();
    setTimeout(() => {
      UIFunctions.hideLoading();
      Utils.showNotification('Registration successful! Please log in.', 'success');
      UIFunctions.hideModal('#registerModal');
      e.target.reset();
    }, 1500);
  }
};

EventHandlers.handleReviewForm = function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate form
  if (!data.title || !data.rating || !data.review) {
    Utils.showNotification('Please fill in all required fields', 'warning');
    return;
  }

  Utils.showNotification('Thank you for your review!', 'success');
  e.target.reset();
  UIFunctions.hideModal('#reviewModal');
};

EventHandlers.handleAddToCart = function(productId, quantity = 1, button) {
  // Use Cart module if available
  if (typeof Cart !== 'undefined' && Cart.add) {
    // Get product data from button attributes
    const productData = {
      name: button.dataset.productName || 'Product',
      price: parseFloat(button.dataset.productPrice) || 0,
      image: button.dataset.productImage || '/assets/images/placeholder.jpg',
      description: button.dataset.productDescription || ''
    };
    
    Cart.add(productId, quantity, productData);
  } else {
    // Fallback
    Utils.showNotification('Item added to cart!', 'success');
  }
};

EventHandlers.handleRemoveFromCart = function(productId) {
  if (typeof Cart !== 'undefined' && Cart.remove) {
    Cart.remove(productId);
  } else {
    Utils.showNotification('Item removed from cart', 'info');
  }
};

EventHandlers.handleUpdateCartQuantity = function(productId, quantity) {
  if (typeof Cart !== 'undefined' && Cart.updateQuantity) {
    Cart.updateQuantity(productId, quantity);
  }
};

EventHandlers.handleClearCart = function() {
  if (confirm('Are you sure you want to clear your cart?')) {
    if (typeof Cart !== 'undefined' && Cart.clear) {
      Cart.clear();
    } else {
      Utils.showNotification('Cart cleared', 'info');
    }
  }
};

EventHandlers.handleCheckout = function() {
  if (AURAVE.cart.length === 0) {
    Utils.showNotification('Your cart is empty', 'warning');
    return;
  }
  
  // Redirect to checkout page
  window.location.href = 'pages/checkout.html';
};

EventHandlers.handleImageZoom = function(img) {
  // Create modal for image zoom
  const modal = Utils.create('div', 'modal fade', `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Product Image</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <img src="${img.src}" alt="${img.alt}" class="img-fluid">
        </div>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
};

EventHandlers.handleWishlistToggle = function(productId, button) {
  // Toggle wishlist icon
  const icon = button.querySelector('i');
  if (icon.classList.contains('bi-heart')) {
    icon.classList.remove('bi-heart');
    icon.classList.add('bi-heart-fill');
    button.classList.add('active');
    Utils.showNotification('Added to wishlist', 'success');
  } else {
    icon.classList.remove('bi-heart-fill');
    icon.classList.add('bi-heart');
    button.classList.remove('active');
    Utils.showNotification('Removed from wishlist', 'info');
  }
};

EventHandlers.handleSizeSelection = function(size, button) {
  // Update active size
  button.parentElement.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active', 'btn-primary');
    btn.classList.add('btn-outline-secondary');
  });
  button.classList.add('active', 'btn-primary');
  button.classList.remove('btn-outline-secondary');
  
  Utils.log(`Size selected: ${size}`, 'info');
};

EventHandlers.handleColorSelection = function(color, button) {
  // Update active color
  button.parentElement.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  Utils.log(`Color selected: ${color}`, 'info');
};

EventHandlers.handleCategoryFilter = function(category) {
  // Update active filter
  Utils.selectAll('.category-filter').forEach(filter => {
    filter.classList.remove('active');
  });
  Utils.select(`[data-category="${category}"]`).classList.add('active');
  
  Utils.showNotification(`Filtering by ${category}`, 'info');
};

EventHandlers.handlePriceFilter = function(maxPrice) {
  Utils.log(`Price filter: $${maxPrice}`, 'info');
  // Update price display
  const priceValue = Utils.select('#price-value');
  if (priceValue) {
    priceValue.textContent = `$${maxPrice}`;
  }
};

EventHandlers.handleSort = function(sortBy) {
  Utils.showNotification(`Sorting by ${sortBy}`, 'info');
};

EventHandlers.handleSearch = function(query) {
  if (query.length >= 2) {
    Utils.log(`Searching for: ${query}`, 'info');
  }
};

EventHandlers.handleClearFilters = function() {
  // Reset all filters
  Utils.select('#category-filter').value = '';
  Utils.select('#sort-select').value = 'newest';
  Utils.select('#search-input').value = '';
  Utils.select('#price-range').value = 500;
  Utils.select('#price-value').textContent = '$500';
  
  // Clear active filter buttons
  Utils.selectAll('.size-filter, .color-filter').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('btn-outline-secondary');
  });
  
  Utils.showNotification('Filters cleared', 'info');
};

// Initialize all events
const initEvents = function() {
  Utils.log('Initializing event handlers...', 'info');
  
  EventHandlers.initNavigation();
  EventHandlers.initForms();
  EventHandlers.initProducts();
  EventHandlers.initCart();
  EventHandlers.initFilters();
  EventHandlers.initWindowEvents();
  
  Utils.log('Event handlers initialized successfully', 'success');
};

// Make event handlers globally available
window.EventHandlers = EventHandlers;
window.Events = { init: initEvents };