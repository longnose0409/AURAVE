// ===========================
// AURAVE - Core Utility Functions
// "Luxury Fashion for Every Aura"
//
// This file contains all core utility functions used throughout the AURAVE application.
// It includes logging, DOM manipulation, validation, storage helpers, and product utilities.
//
// Author: AURAVE Development Team
// Version: 1.0
// Last Updated: 2025
// ===========================

// ===========================
// GLOBAL CONFIGURATION
// Main AURAVE application configuration and state
// ===========================
const AURAVE = {
  config: {
    apiUrl: '/api',
    currency: 'USD',
    taxRate: 0.08,
    shippingRate: 0.05,
    freeShippingThreshold: 100
  },
  cart: [],
  user: null,
  wishlist: [],
  products: []
};

// ===========================
// UTILITY FUNCTIONS
// Core utility functions for logging, DOM manipulation, validation, etc.
// ===========================
const Utils = {
  // Logging with AURAVE branding
  log: function(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[AURAVE ${type.toUpperCase()}]`;
    console.log(`${prefix} ${timestamp}: ${message}`);
  },

  // DOM Selection helpers
  select: function(selector) {
    return document.querySelector(selector);
  },

  selectAll: function(selector) {
    return document.querySelectorAll(selector);
  },

  // Element creation helper
  create: function(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
  },

  // Format currency
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: AURAVE.config.currency
    }).format(amount);
  },

  // Generate unique ID
  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function for performance
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Local Storage helpers
  storage: {
    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        Utils.log(`Saved to localStorage: ${key}`, 'info');
      } catch (e) {
        Utils.log(`Error saving to localStorage: ${e.message}`, 'error');
      }
    },
    
    get: function(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        Utils.log(`Error reading from localStorage: ${e.message}`, 'error');
        return null;
      }
    },
    
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        Utils.log(`Removed from localStorage: ${key}`, 'info');
      } catch (e) {
        Utils.log(`Error removing from localStorage: ${e.message}`, 'error');
      }
    }
  },

  // Show notification toast
  showNotification: function(message, type = 'info', duration = 5000) {
    const notification = Utils.create('div', `alert alert-${type} alert-dismissible fade show position-fixed`, `
      <i class="bi bi-${this.getNotificationIcon(type)} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `);
    
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  },

  // Get notification icon based on type
  getNotificationIcon: function(type) {
    const icons = {
      'success': 'check-circle',
      'error': 'exclamation-triangle',
      'warning': 'exclamation-circle',
      'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
  },

  // Validate email
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  validatePhone: function(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
  },

  // Format date
  formatDate: function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Scroll to element smoothly
  scrollTo: function(element, offset = 0) {
    const target = typeof element === 'string' ? Utils.select(element) : element;
    if (target) {
      const targetPosition = target.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Check if element is in viewport
  isInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Animate element
  animateElement: function(element, animation, duration = 1000) {
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  },

  // Get URL parameters
  getUrlParams: function() {
    const params = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlSearchParams) {
      params[key] = value;
    }
    return params;
  },

  // Set URL parameter
  setUrlParam: function(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },

  // Remove URL parameter
  removeUrlParam: function(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
  },

  // Copy to clipboard
  copyToClipboard: function(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        Utils.showNotification('Copied to clipboard!', 'success');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      Utils.showNotification('Copied to clipboard!', 'success');
    }
  },

  // Generate random string
  generateRandomString: function(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Deep clone object
  deepClone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Check if mobile device
  isMobile: function() {
    return window.innerWidth <= 768;
  },

  // Check if tablet device
  isTablet: function() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  // Check if desktop device
  isDesktop: function() {
    return window.innerWidth > 1024;
  }
};

// Product Utility Functions
const ProductUtils = {
  // Calculate discount percentage
  calculateDiscount: function(originalPrice, salePrice) {
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  },

  // Calculate tax
  calculateTax: function(amount) {
    return amount * AURAVE.config.taxRate;
  },

  // Calculate shipping
  calculateShipping: function(amount) {
    if (amount >= AURAVE.config.freeShippingThreshold) return 0;
    return amount * AURAVE.config.shippingRate;
  },

  // Calculate total with tax and shipping
  calculateTotal: function(amount) {
    const tax = ProductUtils.calculateTax(amount);
    const shipping = ProductUtils.calculateShipping(amount);
    return amount + tax + shipping;
  },

  // Format product data
  formatProduct: function(product) {
    return {
      id: product.id || Utils.generateId(),
      name: product.name || 'Unnamed Product',
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
      image: product.image || '/assets/images/placeholder.jpg',
      images: product.images || [product.image || '/assets/images/placeholder.jpg'],
      description: product.description || '',
      shortDescription: product.shortDescription || product.description || '',
      category: product.category || 'general',
      subcategory: product.subcategory || '',
      brand: product.brand || 'AURAVE',
      inStock: product.inStock !== false,
      quantity: parseInt(product.quantity) || 1,
      maxQuantity: parseInt(product.maxQuantity) || 10,
      discount: ProductUtils.calculateDiscount(
        parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
        parseFloat(product.price) || 0
      ),
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.reviewCount) || 0,
      tags: product.tags || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      weight: parseFloat(product.weight) || 0,
      dimensions: product.dimensions || {},
      sku: product.sku || Utils.generateRandomString(8).toUpperCase(),
      featured: product.featured || false,
      new: product.new || false,
      sale: product.sale || false,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString()
    };
  },

  // Search products
  searchProducts: function(query, products = AURAVE.products) {
    if (!query) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  // Filter products by category
  filterByCategory: function(category, products = AURAVE.products) {
    if (!category) return products;
    return products.filter(product => product.category === category);
  },

  // Sort products
  sortProducts: function(products, sortBy = 'name') {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'featured':
        return sorted.sort((a, b) => b.featured - a.featured);
      default:
        return sorted;
    }
  }
};

// Initialize AURAVE
const initAURAVE = function() {
  Utils.log('Initializing AURAVE application...', 'info');
  
  // Load saved data
  AURAVE.cart = Utils.storage.get('aurave_cart') || [];
  AURAVE.user = Utils.storage.get('aurave_user');
  AURAVE.wishlist = Utils.storage.get('aurave_wishlist') || [];
  
  // Initialize other modules
  if (typeof UI !== 'undefined') UI.init();
  if (typeof Events !== 'undefined') Events.init();
  if (typeof Auth !== 'undefined') Auth.init();
  if (typeof Cart !== 'undefined') Cart.init();
  
  Utils.log('AURAVE application initialized successfully!', 'success');
};

// Make functions globally available
window.AURAVE = AURAVE;
window.Utils = Utils;
window.ProductUtils = ProductUtils;
window.log = Utils.log;
window.select = Utils.select;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAURAVE);
} else {
  initAURAVE();
}