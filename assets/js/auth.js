// ===========================
// AURAVE - Authentication System
// "Luxury Fashion for Every Aura"
//
// This file handles user authentication including login, registration, logout,
// session management, and user profile operations.
//
// Author: AURAVE Development Team
// Version: 1.0
// Last Updated: 2025
// ===========================

// ===========================
// AUTHENTICATION STATE
// Tracks the current authentication state and user session
// ===========================
const AuthState = {
  isAuthenticated: false,
  currentUser: null,
  token: null,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  lastActivity: null
};

// Authentication Functions
const AuthFunctions = {
  // Login user
  login: async function(email, password) {
    try {
      UIFunctions.showLoading();
      
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store authentication data
      AuthState.isAuthenticated = true;
      AuthState.currentUser = data.user;
      AuthState.token = data.token;
      AuthState.lastActivity = Date.now();
      
      // Save to localStorage
      Utils.storage.set('aurave_auth_token', data.token);
      Utils.storage.set('aurave_user', data.user);
      Utils.storage.set('aurave_last_activity', AuthState.lastActivity);
      
      UIFunctions.hideLoading();
      Utils.showNotification('Login successful!', 'success');
      
      // Update UI
      this.updateAuthUI();
      
      return { success: true, user: data.user };
      
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('Login failed. Please check your credentials.', 'error');
      Utils.log('Login error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Register user
  register: async function(userData) {
    try {
      UIFunctions.showLoading();
      
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      UIFunctions.hideLoading();
      Utils.showNotification('Registration successful! Please log in.', 'success');
      
      return { success: true, message: data.message };
      
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('Registration failed. Please try again.', 'error');
      Utils.log('Registration error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Logout user
  logout: function() {
    AuthState.isAuthenticated = false;
    AuthState.currentUser = null;
    AuthState.token = null;
    AuthState.lastActivity = null;
    
    // Clear localStorage
    Utils.storage.remove('aurave_auth_token');
    Utils.storage.remove('aurave_user');
    Utils.storage.remove('aurave_last_activity');
    
    // Update UI
    this.updateAuthUI();
    
    Utils.showNotification('Logged out successfully', 'info');
    
    // Redirect to home page
    window.location.href = '/';
  },

  // Check if user is authenticated
  checkAuth: function() {
    const token = Utils.storage.get('aurave_auth_token');
    const user = Utils.storage.get('aurave_user');
    const lastActivity = Utils.storage.get('aurave_last_activity');
    
    if (token && user) {
      // Check session timeout
      if (lastActivity && (Date.now() - lastActivity) > AuthState.sessionTimeout) {
        Utils.log('Session expired', 'warning');
        this.logout();
        return false;
      }
      
      AuthState.isAuthenticated = true;
      AuthState.currentUser = user;
      AuthState.token = token;
      AuthState.lastActivity = lastActivity || Date.now();
      return true;
    }
    
    return false;
  },

  // Get current user
  getCurrentUser: function() {
    return AuthState.currentUser;
  },

  // Check if user is logged in
  isLoggedIn: function() {
    return AuthState.isAuthenticated;
  },

  // Update authentication UI
  updateAuthUI: function() {
    const authButtons = Utils.selectAll('.auth-buttons');
    const userMenu = Utils.select('.user-menu');
    const loginBtn = Utils.select('.login-btn');
    const registerBtn = Utils.select('.register-btn');
    const logoutBtn = Utils.select('.logout-btn');
    const profileBtn = Utils.select('.profile-btn');

    if (AuthState.isAuthenticated) {
      // Show user menu, hide auth buttons
      authButtons.forEach(btn => btn.style.display = 'none');
      if (userMenu) userMenu.style.display = 'block';
      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (profileBtn) profileBtn.style.display = 'block';
      
      // Update user name in UI
      const userNameElements = Utils.selectAll('.user-name');
      userNameElements.forEach(el => {
        el.textContent = AuthState.currentUser?.name || 'User';
      });
      
    } else {
      // Show auth buttons, hide user menu
      authButtons.forEach(btn => btn.style.display = 'block');
      if (userMenu) userMenu.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'block';
      if (registerBtn) registerBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (profileBtn) profileBtn.style.display = 'none';
    }
  },

  // Validate token
  validateToken: async function() {
    if (!AuthState.token) return false;
    
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${AuthState.token}`
        }
      });
      
      if (response.ok) {
        AuthState.lastActivity = Date.now();
        Utils.storage.set('aurave_last_activity', AuthState.lastActivity);
        return true;
      } else {
        // Token is invalid, logout user
        this.logout();
        return false;
      }
    } catch (error) {
      Utils.log('Token validation error:', 'error');
      return false;
    }
  },

  // Forgot password
  forgotPassword: async function(email) {
    try {
      UIFunctions.showLoading();
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      UIFunctions.hideLoading();
      
      if (response.ok) {
        Utils.showNotification('Password reset email sent!', 'success');
        return { success: true };
      } else {
        Utils.showNotification('Failed to send reset email', 'error');
        return { success: false };
      }
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('An error occurred. Please try again.', 'error');
      Utils.log('Forgot password error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async function(token, newPassword) {
    try {
      UIFunctions.showLoading();
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      UIFunctions.hideLoading();
      
      if (response.ok) {
        Utils.showNotification('Password reset successful!', 'success');
        return { success: true };
      } else {
        Utils.showNotification('Failed to reset password', 'error');
        return { success: false };
      }
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('An error occurred. Please try again.', 'error');
      Utils.log('Reset password error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async function(profileData) {
    try {
      UIFunctions.showLoading();
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthState.token}`
        },
        body: JSON.stringify(profileData)
      });

      UIFunctions.hideLoading();
      
      if (response.ok) {
        const updatedUser = await response.json();
        AuthState.currentUser = updatedUser;
        Utils.storage.set('aurave_user', updatedUser);
        
        Utils.showNotification('Profile updated successfully!', 'success');
        this.updateAuthUI();
        
        return { success: true, user: updatedUser };
      } else {
        Utils.showNotification('Failed to update profile', 'error');
        return { success: false };
      }
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('An error occurred. Please try again.', 'error');
      Utils.log('Update profile error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Change password
  changePassword: async function(currentPassword, newPassword) {
    try {
      UIFunctions.showLoading();
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthState.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      UIFunctions.hideLoading();
      
      if (response.ok) {
        Utils.showNotification('Password changed successfully!', 'success');
        return { success: true };
      } else {
        Utils.showNotification('Failed to change password', 'error');
        return { success: false };
      }
    } catch (error) {
      UIFunctions.hideLoading();
      Utils.showNotification('An error occurred. Please try again.', 'error');
      Utils.log('Change password error:', 'error');
      return { success: false, error: error.message };
    }
  },

  // Update last activity
  updateActivity: function() {
    AuthState.lastActivity = Date.now();
    Utils.storage.set('aurave_last_activity', AuthState.lastActivity);
  }
};

// Form validation helpers
const AuthValidation = {
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePassword: function(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
  },

  validateName: function(name) {
    return name && name.trim().length >= 2;
  },

  validatePhone: function(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
  },

  validateForm: function(formData) {
    const errors = [];
    
    if (!formData.name || !this.validateName(formData.name)) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!formData.email || !this.validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.password && !this.validatePassword(formData.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (formData.phone && !this.validatePhone(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return errors;
  }
};

// Session management
const SessionManager = {
  // Check session timeout
  checkSession: function() {
    if (AuthState.isAuthenticated && AuthState.lastActivity) {
      const timeSinceActivity = Date.now() - AuthState.lastActivity;
      if (timeSinceActivity > AuthState.sessionTimeout) {
        Utils.log('Session expired due to inactivity', 'warning');
        AuthFunctions.logout();
        return false;
      }
    }
    return true;
  },

  // Extend session
  extendSession: function() {
    if (AuthState.isAuthenticated) {
      AuthFunctions.updateActivity();
    }
  },

  // Initialize session monitoring
  init: function() {
    // Check session every minute
    setInterval(() => {
      this.checkSession();
    }, 60000);

    // Update activity on user interaction
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.extendSession();
      }, true);
    });
  }
};

// Initialize authentication
const initAuth = function() {
  Utils.log('Initializing authentication system...', 'info');
  
  // Check if user is already authenticated
  AuthFunctions.checkAuth();
  
  // Update UI based on auth state
  AuthFunctions.updateAuthUI();
  
  // Initialize session management
  SessionManager.init();
  
  // Add event listeners for auth buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.logout-btn')) {
      e.preventDefault();
      AuthFunctions.logout();
    }
    
    if (e.target.closest('.profile-btn')) {
      e.preventDefault();
      // Redirect to profile page
      window.location.href = 'pages/profile.html';
    }
  });
  
  Utils.log('Authentication system initialized', 'success');
};

// Make auth functions globally available
window.AuthState = AuthState;
window.AuthFunctions = AuthFunctions;
window.AuthValidation = AuthValidation;
window.Auth = {
  login: AuthFunctions.login,
  register: AuthFunctions.register,
  logout: AuthFunctions.logout,
  isLoggedIn: AuthFunctions.isLoggedIn,
  getCurrentUser: AuthFunctions.getCurrentUser,
  updateProfile: AuthFunctions.updateProfile,
  changePassword: AuthFunctions.changePassword,
  forgotPassword: AuthFunctions.forgotPassword,
  resetPassword: AuthFunctions.resetPassword,
  init: initAuth
};