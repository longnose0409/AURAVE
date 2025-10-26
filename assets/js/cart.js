// ===========================
// AURAVE - Shopping Cart System
// "Luxury Fashion for Every Aura"
//
// This file handles all shopping cart functionality including adding/removing items,
// quantity updates, price calculations, and cart UI management.
//
// Author: AURAVE Development Team
// Version: 1.0
// Last Updated: 2025
// ===========================

// ===========================
// CART STATE MANAGEMENT
// Tracks the current state of the shopping cart
// ===========================
const CartState = {
  items: [],
  total: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  discountCode: null,
  isOpen: false,
  maxItems: 50
};

// Cart Functions
const CartFunctions = {
  // Add item to cart
  add: function(productId, quantity = 1, productData = {}) {
    try {
      // Validate input
      if (!productId) {
        Utils.showNotification('Product ID is required', 'warning');
        return false;
      }

      if (quantity <= 0) {
        Utils.showNotification('Quantity must be greater than 0', 'warning');
        return false;
      }

      // Check if cart is full
      if (CartState.items.length >= CartState.maxItems) {
        Utils.showNotification(`Cart is full (max ${CartState.maxItems} items)`, 'warning');
        return false;
      }

      // Check if item already exists
      const existingItem = CartState.items.find(item => item.id === productId);
      
      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
        Utils.showNotification(`Updated quantity for ${existingItem.name}`, 'info');
      } else {
        // Add new item
        const newItem = {
          id: productId,
          name: productData.name || 'Product',
          price: parseFloat(productData.price) || 0,
          originalPrice: parseFloat(productData.originalPrice) || parseFloat(productData.price) || 0,
          image: productData.image || '/assets/images/placeholder.jpg',
          description: productData.description || '',
          quantity: quantity,
          total: (parseFloat(productData.price) || 0) * quantity,
          size: productData.size || '',
          color: productData.color || '',
          sku: productData.sku || '',
          weight: parseFloat(productData.weight) || 0,
          addedAt: new Date().toISOString()
        };
        
        CartState.items.push(newItem);
        Utils.showNotification(`${newItem.name} added to cart`, 'success');
      }

      // Update cart totals
      this.updateTotals();
      
      // Save to localStorage
      this.saveCart();
      
      // Update UI
      this.updateCartUI();
      
      // Update cart count in navbar
      UIFunctions.updateCartCount(this.getItemCount());
      
      return true;
      
    } catch (error) {
      Utils.log('Error adding item to cart:', 'error');
      Utils.showNotification('Failed to add item to cart', 'error');
      return false;
    }
  },

  // Remove item from cart
  remove: function(productId) {
    try {
      const itemIndex = CartState.items.findIndex(item => item.id === productId);
      
      if (itemIndex === -1) {
        Utils.showNotification('Item not found in cart', 'warning');
        return false;
      }

      const removedItem = CartState.items[itemIndex];
      CartState.items.splice(itemIndex, 1);
      
      // Update cart totals
      this.updateTotals();
      
      // Save to localStorage
      this.saveCart();
      
      // Update UI
      this.updateCartUI();
      
      // Update cart count in navbar
      UIFunctions.updateCartCount(this.getItemCount());
      
      Utils.showNotification(`${removedItem.name} removed from cart`, 'info');
      return true;
      
    } catch (error) {
      Utils.log('Error removing item from cart:', 'error');
      Utils.showNotification('Failed to remove item from cart', 'error');
      return false;
    }
  },

  // Update item quantity
  updateQuantity: function(productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.remove(productId);
      }

      const item = CartState.items.find(item => item.id === productId);
      
      if (!item) {
        Utils.showNotification('Item not found in cart', 'warning');
        return false;
      }

      item.quantity = quantity;
      item.total = item.price * quantity;
      
      // Update cart totals
      this.updateTotals();
      
      // Save to localStorage
      this.saveCart();
      
      // Update UI
      this.updateCartUI();
      
      return true;
      
    } catch (error) {
      Utils.log('Error updating item quantity:', 'error');
      Utils.showNotification('Failed to update item quantity', 'error');
      return false;
    }
  },

  // Clear entire cart
  clear: function() {
    try {
      CartState.items = [];
      this.updateTotals();
      this.saveCart();
      this.updateCartUI();
      UIFunctions.updateCartCount(0);
      
      Utils.showNotification('Cart cleared', 'info');
      return true;
      
    } catch (error) {
      Utils.log('Error clearing cart:', 'error');
      Utils.showNotification('Failed to clear cart', 'error');
      return false;
    }
  },

  // Get cart items
  getItems: function() {
    return CartState.items;
  },

  // Get item count
  getItemCount: function() {
    return CartState.items.reduce((total, item) => total + item.quantity, 0);
  },

  // Get cart total
  getTotal: function() {
    return CartState.total;
  },

  // Get cart subtotal
  getSubtotal: function() {
    return CartState.subtotal;
  },

  // Check if cart is empty
  isEmpty: function() {
    return CartState.items.length === 0;
  },

  // Update cart totals
  updateTotals: function() {
    // Calculate subtotal
    CartState.subtotal = CartState.items.reduce((total, item) => total + item.total, 0);
    
    // Calculate tax
    CartState.tax = CartState.subtotal * AURAVE.config.taxRate;
    
    // Calculate shipping
    if (CartState.subtotal >= AURAVE.config.freeShippingThreshold) {
      CartState.shipping = 0;
    } else {
      CartState.shipping = CartState.subtotal * AURAVE.config.shippingRate;
    }
    
    // Calculate total
    CartState.total = CartState.subtotal + CartState.tax + CartState.shipping - CartState.discount;
    
    // Ensure total is not negative
    if (CartState.total < 0) {
      CartState.total = 0;
    }
  },

  // Apply discount code
  applyDiscount: function(code) {
    try {
      // Simulate discount code validation
      const validCodes = {
        'WELCOME10': { type: 'percentage', value: 10 },
        'SAVE20': { type: 'percentage', value: 20 },
        'FREESHIP': { type: 'shipping', value: 100 },
        'FIXED10': { type: 'fixed', value: 10 }
      };

      const discount = validCodes[code.toUpperCase()];
      
      if (!discount) {
        Utils.showNotification('Invalid discount code', 'warning');
        return false;
      }

      CartState.discountCode = code.toUpperCase();
      
      if (discount.type === 'percentage') {
        CartState.discount = (CartState.subtotal * discount.value) / 100;
      } else if (discount.type === 'fixed') {
        CartState.discount = Math.min(discount.value, CartState.subtotal);
      } else if (discount.type === 'shipping') {
        CartState.shipping = 0;
      }
      
      this.updateTotals();
      this.updateCartUI();
      
      Utils.showNotification(`Discount code applied: ${code}`, 'success');
      return true;
      
    } catch (error) {
      Utils.log('Error applying discount:', 'error');
      Utils.showNotification('Failed to apply discount code', 'error');
      return false;
    }
  },

  // Remove discount code
  removeDiscount: function() {
    CartState.discountCode = null;
    CartState.discount = 0;
    this.updateTotals();
    this.updateCartUI();
    Utils.showNotification('Discount code removed', 'info');
  },

  // Save cart to localStorage
  saveCart: function() {
    Utils.storage.set('aurave_cart', CartState.items);
    Utils.storage.set('aurave_cart_discount', {
      code: CartState.discountCode,
      amount: CartState.discount
    });
  },

  // Load cart from localStorage
  loadCart: function() {
    const savedItems = Utils.storage.get('aurave_cart') || [];
    const savedDiscount = Utils.storage.get('aurave_cart_discount') || {};
    
    CartState.items = savedItems;
    CartState.discountCode = savedDiscount.code || null;
    CartState.discount = savedDiscount.amount || 0;
    
    this.updateTotals();
    this.updateCartUI();
    UIFunctions.updateCartCount(this.getItemCount());
  },

  // Update cart UI
  updateCartUI: function() {
    // Update cart dropdown/sidebar
    this.updateCartDropdown();
    
    // Update cart page if on cart page
    if (window.location.pathname.includes('cart')) {
      this.updateCartPage();
    }
  },

  // Update cart dropdown
  updateCartDropdown: function() {
    const cartContainer = Utils.select('#cart-container');
    if (!cartContainer) return;

    if (this.isEmpty()) {
      cartContainer.innerHTML = `
        <div class="text-center p-4">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <h5 class="mt-3">Your cart is empty</h5>
          <p class="text-muted">Add some items to get started</p>
          <a href="pages/shop.html" class="btn btn-orange">Start Shopping</a>
        </div>
      `;
    } else {
      cartContainer.innerHTML = `
        <div class="cart-items">
          ${CartState.items.map(item => `
            <div class="cart-item d-flex align-items-center p-3 border-bottom">
              <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
              <div class="flex-grow-1">
                <h6 class="mb-1">${item.name}</h6>
                <small class="text-muted">${item.size} ${item.color}</small>
                <div class="d-flex align-items-center mt-2">
                  <div class="quantity-controls d-flex align-items-center me-3">
                    <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                    <input type="number" class="form-control form-control-sm quantity-input text-center mx-2" value="${item.quantity}" min="1" max="10" style="width: 60px;" data-product-id="${item.id}">
                    <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold">${Utils.formatCurrency(item.total)}</div>
                    <button class="btn btn-sm text-danger remove-from-cart" data-product-id="${item.id}">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cart-summary p-3">
          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>${Utils.formatCurrency(CartState.subtotal)}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Tax:</span>
            <span>${Utils.formatCurrency(CartState.tax)}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Shipping:</span>
            <span>${CartState.shipping === 0 ? 'Free' : Utils.formatCurrency(CartState.shipping)}</span>
          </div>
          ${CartState.discount > 0 ? `
            <div class="d-flex justify-content-between mb-2 text-success">
              <span>Discount (${CartState.discountCode}):</span>
              <span>-${Utils.formatCurrency(CartState.discount)}</span>
            </div>
          ` : ''}
          <hr>
          <div class="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span>${Utils.formatCurrency(CartState.total)}</span>
          </div>
          <div class="mt-3">
            <a href="pages/cart.html" class="btn btn-outline-secondary w-100 mb-2">View Cart</a>
            <a href="pages/checkout.html" class="btn btn-orange w-100">Checkout</a>
          </div>
        </div>
      `;
    }
  },

  // Update cart page
  updateCartPage: function() {
    const cartItemsContainer = Utils.select('#cart-items-container');
    const cartSummaryContainer = Utils.select('#cart-summary-container');
    
    if (!cartItemsContainer || !cartSummaryContainer) return;

    // Update cart items
    if (this.isEmpty()) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <h3 class="mt-3">Your cart is empty</h3>
          <p class="text-muted">Add some items to get started</p>
          <a href="pages/shop.html" class="btn btn-orange">Start Shopping</a>
        </div>
      `;
      cartSummaryContainer.innerHTML = '';
    } else {
      cartItemsContainer.innerHTML = `
        <div class="cart-items">
          ${CartState.items.map(item => `
            <div class="cart-item card mb-3">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-2">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                  </div>
                  <div class="col-md-4">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text text-muted">${item.description}</p>
                    <small class="text-muted">Size: ${item.size} | Color: ${item.color}</small>
                  </div>
                  <div class="col-md-2">
                    <div class="input-group">
                      <button class="btn btn-outline-secondary quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                      <input type="number" class="form-control quantity-input text-center" value="${item.quantity}" min="1" max="10" data-product-id="${item.id}">
                      <button class="btn btn-outline-secondary quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
                    </div>
                  </div>
                  <div class="col-md-2 text-center">
                    <div class="fw-bold">${Utils.formatCurrency(item.total)}</div>
                    <small class="text-muted">${Utils.formatCurrency(item.price)} each</small>
                  </div>
                  <div class="col-md-2 text-end">
                    <button class="btn btn-outline-danger remove-from-cart" data-product-id="${item.id}">
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Update cart summary
      cartSummaryContainer.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Order Summary</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal (${this.getItemCount()} items):</span>
              <span>${Utils.formatCurrency(CartState.subtotal)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Tax:</span>
              <span>${Utils.formatCurrency(CartState.tax)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Shipping:</span>
              <span>${CartState.shipping === 0 ? 'Free' : Utils.formatCurrency(CartState.shipping)}</span>
            </div>
            ${CartState.discount > 0 ? `
              <div class="d-flex justify-content-between mb-2 text-success">
                <span>Discount (${CartState.discountCode}):</span>
                <span>-${Utils.formatCurrency(CartState.discount)}</span>
              </div>
            ` : ''}
            <hr>
            <div class="d-flex justify-content-between fw-bold fs-5">
              <span>Total:</span>
              <span>${Utils.formatCurrency(CartState.total)}</span>
            </div>
            <div class="mt-3">
              <a href="pages/checkout.html" class="btn btn-orange w-100">Proceed to Checkout</a>
            </div>
          </div>
        </div>
      `;
    }
  },

  // Toggle cart visibility
  toggle: function() {
    UIFunctions.toggleCart();
  },

  // Open cart
  open: function() {
    if (!CartState.isOpen) {
      UIFunctions.toggleCart();
    }
  },

  // Close cart
  close: function() {
    if (CartState.isOpen) {
      UIFunctions.toggleCart();
    }
  }
};

// Initialize cart
const initCart = function() {
  Utils.log('Initializing cart system...', 'info');
  
  // Load cart from localStorage
  CartFunctions.loadCart();
  
  // Update cart UI
  CartFunctions.updateCartUI();
  
  Utils.log('Cart system initialized', 'success');
};

// Make cart functions globally available
window.CartState = CartState;
window.CartFunctions = CartFunctions;
window.Cart = {
  add: CartFunctions.add,
  remove: CartFunctions.remove,
  updateQuantity: CartFunctions.updateQuantity,
  clear: CartFunctions.clear,
  getItems: CartFunctions.getItems,
  getItemCount: CartFunctions.getItemCount,
  getTotal: CartFunctions.getTotal,
  getSubtotal: CartFunctions.getSubtotal,
  isEmpty: CartFunctions.isEmpty,
  applyDiscount: CartFunctions.applyDiscount,
  removeDiscount: CartFunctions.removeDiscount,
  toggle: CartFunctions.toggle,
  open: CartFunctions.open,
  close: CartFunctions.close,
  init: initCart
};