// ===========================
// AURAVE - UI Management & Animations
// "Luxury Fashion for Every Aura"
//
// This file handles all UI interactions, animations, and visual effects.
// It includes loading states, modals, notifications, scroll effects, and responsive behavior.
//
// Author: AURAVE Development Team
// Version: 1.0
// Last Updated: 2025
// ===========================

// ===========================
// UI STATE MANAGEMENT
// Tracks the current state of UI components and interactions
// ===========================
const UIState = {
  isLoading: false,
  currentPage: 'home',
  mobileMenuOpen: false,
  searchOpen: false,
  cartOpen: false,
  modalOpen: false,
  animationsEnabled: true
};

// ===========================
// UI FUNCTIONS
// Core UI manipulation and interaction functions
// ===========================
const UIFunctions = {
  // Show loading spinner
  showLoading: function(element = document.body) {
    UIState.isLoading = true;
    const spinner = Utils.create('div', 'loading-spinner', `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `);
    spinner.id = 'loading-spinner';
    element.appendChild(spinner);
    Utils.log('Loading spinner shown', 'info');
  },

  // Hide loading spinner
  hideLoading: function() {
    UIState.isLoading = false;
    const spinner = Utils.select('#loading-spinner');
    if (spinner) {
      spinner.remove();
      Utils.log('Loading spinner hidden', 'info');
    }
  },

  // Toggle mobile menu
  toggleMobileMenu: function() {
    UIState.mobileMenuOpen = !UIState.mobileMenuOpen;
    const menu = Utils.select('#navMenu');
    const toggler = Utils.select('.navbar-toggler');
    
    if (menu) {
      menu.classList.toggle('show');
    }
    
    if (toggler) {
      toggler.classList.toggle('active');
    }
    
    Utils.log(`Mobile menu ${UIState.mobileMenuOpen ? 'opened' : 'closed'}`, 'info');
  },

  // Toggle search
  toggleSearch: function() {
    UIState.searchOpen = !UIState.searchOpen;
    const searchContainer = Utils.select('#search-container');
    
    if (searchContainer) {
      searchContainer.classList.toggle('show');
      if (UIState.searchOpen) {
        const searchInput = searchContainer.querySelector('input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    }
    
    Utils.log(`Search ${UIState.searchOpen ? 'opened' : 'closed'}`, 'info');
  },

  // Toggle cart
  toggleCart: function() {
    UIState.cartOpen = !UIState.cartOpen;
    const cartContainer = Utils.select('#cart-container');
    
    if (cartContainer) {
      cartContainer.classList.toggle('show');
    }
    
    Utils.log(`Cart ${UIState.cartOpen ? 'opened' : 'closed'}`, 'info');
  },

  // Update cart count in navbar
  updateCartCount: function(count) {
    const cartIcon = Utils.select('.bi-bag');
    if (cartIcon) {
      let badge = cartIcon.querySelector('.badge');
      if (!badge) {
        badge = Utils.create('span', 'badge bg-danger position-absolute top-0 start-100 translate-middle');
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  },

  // Animate element with custom animation
  animateElement: function(element, animation, duration = 1000) {
    if (!UIState.animationsEnabled) return;
    
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  },

  // Fade in elements on scroll
  initScrollAnimations: function() {
    if (!UIState.animationsEnabled) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements with animation class
    Utils.selectAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  },

  // Smooth scroll to section
  smoothScrollTo: function(target, offset = 80) {
    const element = typeof target === 'string' ? Utils.select(target) : target;
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Show modal
  showModal: function(modalId) {
    const modal = Utils.select(modalId);
    if (modal) {
      UIState.modalOpen = true;
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      Utils.log(`Modal ${modalId} shown`, 'info');
    }
  },

  // Hide modal
  hideModal: function(modalId) {
    const modal = Utils.select(modalId);
    if (modal) {
      UIState.modalOpen = false;
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
        Utils.log(`Modal ${modalId} hidden`, 'info');
      }
    }
  },

  // Update page title
  updatePageTitle: function(title) {
    document.title = `${title} | AURAVE`;
  },

  // Show toast notification
  showToast: function(message, type = 'info', duration = 5000) {
    const toastContainer = Utils.select('#toast-container') || UIFunctions.createToastContainer();
    const toast = Utils.create('div', `toast align-items-center text-white bg-${type} border-0`, `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-${Utils.getNotificationIcon(type)} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `);
    
    toast.setAttribute('role', 'alert');
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  },

  // Create toast container
  createToastContainer: function() {
    const container = Utils.create('div', 'toast-container position-fixed top-0 end-0 p-3');
    container.id = 'toast-container';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  },

  // Initialize tooltips
  initTooltips: function() {
    const tooltipTriggerList = [].slice.call(Utils.selectAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  },

  // Initialize popovers
  initPopovers: function() {
    const popoverTriggerList = [].slice.call(Utils.selectAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  },

  // Add loading state to button
  setButtonLoading: function(button, loading = true) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...';
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  },

  // Toggle animations
  toggleAnimations: function() {
    UIState.animationsEnabled = !UIState.animationsEnabled;
    document.body.classList.toggle('no-animations', !UIState.animationsEnabled);
    Utils.log(`Animations ${UIState.animationsEnabled ? 'enabled' : 'disabled'}`, 'info');
  },

  // Update navbar on scroll
  updateNavbarOnScroll: function() {
    const navbar = Utils.select('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  },

  // Show back to top button
  showBackToTop: function() {
    let backToTop = Utils.select('#back-to-top');
    if (!backToTop) {
      backToTop = Utils.create('button', 'btn btn-orange position-fixed', '<i class="bi bi-arrow-up"></i>');
      backToTop.id = 'back-to-top';
      backToTop.style.cssText = `
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        display: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        padding: 0;
      `;
      document.body.appendChild(backToTop);
      
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    if (window.scrollY > 300) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  },

  // Initialize lazy loading for images
  initLazyLoading: function() {
    const images = Utils.selectAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  },

  // Add ripple effect to buttons
  addRippleEffect: function(button) {
    button.addEventListener('click', function(e) {
      const ripple = Utils.create('span', 'ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  },

  // Initialize all UI components
  init: function() {
    Utils.log('Initializing UI components...', 'info');
    
    // Add event listeners
    this.addEventListeners();
    
    // Initialize scroll animations
    this.initScrollAnimations();
    
    // Initialize tooltips and popovers
    this.initTooltips();
    this.initPopovers();
    
    // Create toast container
    this.createToastContainer();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Add ripple effects to buttons
    Utils.selectAll('.btn').forEach(btn => {
      this.addRippleEffect(btn);
    });
    
    Utils.log('UI components initialized successfully', 'success');
  },

  // Add event listeners
  addEventListeners: function() {
    // Mobile menu toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.navbar-toggler')) {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (UIState.mobileMenuOpen && !e.target.closest('.navbar')) {
        UIState.mobileMenuOpen = false;
        const menu = Utils.select('#navMenu');
        if (menu) {
          menu.classList.remove('show');
        }
      }
    });

    // Search toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.bi-search')) {
        e.preventDefault();
        this.toggleSearch();
      }
    });

    // Cart toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.bi-bag')) {
        e.preventDefault();
        this.toggleCart();
      }
    });

    // Scroll events
    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateNavbarOnScroll();
      this.showBackToTop();
    }, 100));

    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 768) {
        UIState.mobileMenuOpen = false;
        const menu = Utils.select('#navMenu');
        if (menu) {
          menu.classList.remove('show');
        }
      }
    }, 250));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key closes modals and menus
      if (e.key === 'Escape') {
        if (UIState.mobileMenuOpen) {
          this.toggleMobileMenu();
        }
        if (UIState.searchOpen) {
          this.toggleSearch();
        }
        if (UIState.cartOpen) {
          this.toggleCart();
        }
      }
      
      // Ctrl/Cmd + K opens search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleSearch();
      }
    });
  }
};

// Add CSS for ripple effect
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .no-animations * {
    animation: none !important;
    transition: none !important;
  }
`;

// Inject ripple CSS
const style = Utils.create('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Make UI functions globally available
window.UIState = UIState;
window.UIFunctions = UIFunctions;
window.UI = UIFunctions;