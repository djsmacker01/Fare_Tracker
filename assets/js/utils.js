/**
 * Fare Tracker - Utility Functions
 * Description: Helper functions and utilities used throughout the application
 * Author: Your Name
 * Created: 2024
 *
 * This file contains:
 * - Data formatting utilities
 * - Validation functions
 * - Performance optimization helpers
 * - Date/time utilities
 * - DOM manipulation helpers
 * - Mathematical calculations
 */

"use strict";

/**
 * Utility functions namespace
 * Contains all helper functions used throughout the application
 */
const Utils = {
  /**
   * Format a number as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: 'USD')
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted currency string
   */
  formatPrice(amount, currency = "USD", decimals = 2) {
    if (!amount && amount !== 0) {
      return "£0.00";
    }
    return `£${amount.toFixed(decimals)}`;
  },

  /**
   * Format a percentage
   * @param {number} value - Value to format as percentage
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted percentage string
   */
  formatPercentage(value, decimals = 1) {
    try {
      if (typeof value !== "number" || isNaN(value)) {
        return "0.0%";
      }

      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    } catch (error) {
      console.warn("Error formatting percentage:", error);
      return `${value.toFixed(decimals)}%`;
    }
  },

  /**
   * Format a large number with appropriate units
   * @param {number} number - Number to format
   * @returns {string} Formatted number string
   */
  formatLargeNumber(number) {
    try {
      if (typeof number !== "number" || isNaN(number)) {
        return "0";
      }

      const units = ["", "K", "M", "B", "T"];
      let unitIndex = 0;
      let value = Math.abs(number);

      while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex++;
      }

      const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
      return `${number < 0 ? "-" : ""}${formatted}${units[unitIndex]}`;
    } catch (error) {
      console.warn("Error formatting large number:", error);
      return number.toString();
    }
  },

  /**
   * Format time duration
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string
   */
  formatDuration(seconds) {
    try {
      if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
        return "0 seconds";
      }

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);

      const parts = [];
      if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
      }
      if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(
          `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`
        );
      }

      return parts.join(", ");
    } catch (error) {
      console.warn("Error formatting duration:", error);
      return `${seconds} seconds`;
    }
  },

  /**
   * Format relative time (e.g., "2 minutes ago")
   * @param {Date|string|number} date - Date to format
   * @returns {string} Formatted relative time string
   */
  formatRelativeTime(date) {
    try {
      const now = new Date();
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
        return "Invalid date";
      }

      const diffMs = now - targetDate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return diffSeconds <= 1 ? "just now" : `${diffSeconds} seconds ago`;
      } else if (diffMinutes < 60) {
        return diffMinutes === 1
          ? "1 minute ago"
          : `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      }
    } catch (error) {
      console.warn("Error formatting relative time:", error);
      return "Unknown time";
    }
  },

  /**
   * Format time for display
   * @param {Date|string|number} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted time string
   */
  formatTime(date, options = {}) {
    try {
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
        return "Invalid time";
      }

      const defaultOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formatOptions = { ...defaultOptions, ...options };

      return new Intl.DateTimeFormat("en-US", formatOptions).format(targetDate);
    } catch (error) {
      console.warn("Error formatting time:", error);
      return targetDate.toLocaleTimeString();
    }
  },

  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Throttle function to limit function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  validateEmail(email) {
    if (typeof email !== "string") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate location input
   * @param {string} location - Location to validate
   * @returns {Object} Validation result with isValid and message
   */
  validateLocation(location) {
    if (typeof location !== "string") {
      return { isValid: false, message: "Location must be a string" };
    }

    const trimmed = location.trim();

    if (!trimmed) {
      return { isValid: false, message: "Location is required" };
    }

    if (trimmed.length < 2) {
      return {
        isValid: false,
        message: "Location must be at least 2 characters",
      };
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        message: "Location must be less than 100 characters",
      };
    }

    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    const locationRegex = /^[a-zA-Z0-9\s\-\.\,\']+$/;
    if (!locationRegex.test(trimmed)) {
      return {
        isValid: false,
        message: "Location contains invalid characters",
      };
    }

    return { isValid: true, message: "Valid location" };
  },

  /**
   * Validate price input
   * @param {number|string} price - Price to validate
   * @param {number} min - Minimum allowed price (default: 0)
   * @param {number} max - Maximum allowed price (default: 1000)
   * @returns {Object} Validation result with isValid and message
   */
  validatePrice(price, min = 0, max = 1000) {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return { isValid: false, message: "Price must be a valid number" };
    }

    if (numPrice < min) {
      return {
        isValid: false,
        message: `Price must be at least ${this.formatPrice(min)}`,
      };
    }

    if (numPrice > max) {
      return {
        isValid: false,
        message: `Price must be less than ${this.formatPrice(max)}`,
      };
    }

    return { isValid: true, message: "Valid price", value: numPrice };
  },

  /**
   * Calculate percentage change
   * @param {number} oldValue - Original value
   * @param {number} newValue - New value
   * @returns {number} Percentage change
   */
  calculatePercentageChange(oldValue, newValue) {
    if (typeof oldValue !== "number" || typeof newValue !== "number") {
      return 0;
    }

    if (oldValue === 0) {
      return newValue === 0 ? 0 : 100;
    }

    return ((newValue - oldValue) / oldValue) * 100;
  },

  /**
   * Calculate average of an array of numbers
   * @param {number[]} numbers - Array of numbers
   * @returns {number} Average value
   */
  calculateAverage(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(
      (n) => typeof n === "number" && !isNaN(n)
    );

    if (validNumbers.length === 0) {
      return 0;
    }

    const sum = validNumbers.reduce((acc, num) => acc + num, 0);
    return sum / validNumbers.length;
  },

  /**
   * Find minimum value in array
   * @param {number[]} numbers - Array of numbers
   * @returns {number} Minimum value
   */
  findMinimum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(
      (n) => typeof n === "number" && !isNaN(n)
    );
    return validNumbers.length > 0 ? Math.min(...validNumbers) : 0;
  },

  /**
   * Find maximum value in array
   * @param {number[]} numbers - Array of numbers
   * @returns {number} Maximum value
   */
  findMaximum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return 0;
    }

    const validNumbers = numbers.filter(
      (n) => typeof n === "number" && !isNaN(n)
    );
    return validNumbers.length > 0 ? Math.max(...validNumbers) : 0;
  },

  /**
   * Generate a random number within a range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {boolean} integer - Whether to return an integer (default: false)
   * @returns {number} Random number
   */
  randomBetween(min, max, integer = false) {
    const random = Math.random() * (max - min) + min;
    return integer ? Math.floor(random) : random;
  },

  /**
   * Generate a unique ID
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} Unique ID
   */
  generateId(prefix = "") {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return prefix
      ? `${prefix}-${timestamp}-${randomPart}`
      : `${timestamp}-${randomPart}`;
  },

  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.warn("Error deep cloning object:", error);
      return obj;
    }
  },

  /**
   * Check if an object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} True if object is empty
   */
  isEmpty(obj) {
    if (obj == null) {
      return true;
    }
    if (Array.isArray(obj) || typeof obj === "string") {
      return obj.length === 0;
    }
    if (typeof obj === "object") {
      return Object.keys(obj).length === 0;
    }
    return false;
  },

  /**
   * Sanitize HTML string to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHTML(str) {
    if (typeof str !== "string") {
      return "";
    }

    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return str.replace(/[&<>"'/]/g, (s) => map[s]);
  },

  /**
   * Escape special characters for use in regex
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    if (typeof str !== "string" || str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} Title case string
   */
  toTitleCase(str) {
    if (typeof str !== "string") {
      return "";
    }

    return str
      .toLowerCase()
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  },

  /**
   * Truncate string to specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add when truncated (default: '...')
   * @returns {string} Truncated string
   */
  truncate(str, length, suffix = "...") {
    if (typeof str !== "string") {
      return "";
    }
    if (str.length <= length) {
      return str;
    }

    return str.substring(0, length - suffix.length) + suffix;
  },

  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  getElementById(id) {
    try {
      return document.getElementById(id);
    } catch (error) {
      console.warn(`Error getting element by ID '${id}':`, error);
      return null;
    }
  },

  /**
   * Add event listener with error handling
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addEventListener(element, event, handler, options = {}) {
    try {
      if (element && typeof element.addEventListener === "function") {
        element.addEventListener(event, handler, options);
      }
    } catch (error) {
      console.warn("Error adding event listener:", error);
    }
  },

  /**
   * Remove event listener with error handling
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    try {
      if (element && typeof element.removeEventListener === "function") {
        element.removeEventListener(event, handler);
      }
    } catch (error) {
      console.warn("Error removing event listener:", error);
    }
  },

  /**
   * Set element text content safely
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text content
   */
  setTextContent(element, text) {
    try {
      if (element && typeof text === "string") {
        element.textContent = text;
      }
    } catch (error) {
      console.warn("Error setting text content:", error);
    }
  },

  /**
   * Set element HTML content safely (sanitized)
   * @param {HTMLElement} element - Target element
   * @param {string} html - HTML content
   */
  setHTMLContent(element, html) {
    try {
      if (element && typeof html === "string") {
        element.innerHTML = this.sanitizeHTML(html);
      }
    } catch (error) {
      console.warn("Error setting HTML content:", error);
    }
  },

  /**
   * Add CSS class to element
   * @param {HTMLElement} element - Target element
   * @param {string} className - CSS class name
   */
  addClass(element, className) {
    try {
      if (element?.classList && typeof className === "string") {
        element.classList.add(className);
      }
    } catch (error) {
      console.warn("Error adding CSS class:", error);
    }
  },

  /**
   * Remove CSS class from element
   * @param {HTMLElement} element - Target element
   * @param {string} className - CSS class name
   */
  removeClass(element, className) {
    try {
      if (element?.classList && typeof className === "string") {
        element.classList.remove(className);
      }
    } catch (error) {
      console.warn("Error removing CSS class:", error);
    }
  },

  /**
   * Toggle CSS class on element
   * @param {HTMLElement} element - Target element
   * @param {string} className - CSS class name
   * @param {boolean} force - Force add/remove
   * @returns {boolean} True if class is present after toggle
   */
  toggleClass(element, className, force) {
    try {
      if (element?.classList && typeof className === "string") {
        return element.classList.toggle(className, force);
      }
      return false;
    } catch (error) {
      console.warn("Error toggling CSS class:", error);
      return false;
    }
  },

  /**
   * Check if element has CSS class
   * @param {HTMLElement} element - Target element
   * @param {string} className - CSS class name
   * @returns {boolean} True if element has class
   */
  hasClass(element, className) {
    try {
      if (element?.classList && typeof className === "string") {
        return element.classList.contains(className);
      }
      return false;
    } catch (error) {
      console.warn("Error checking CSS class:", error);
      return false;
    }
  },

  /**
   * Get viewport dimensions
   * @returns {Object} Object with width and height
   */
  getViewportSize() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
    };
  },

  /**
   * Check if device is mobile
   * @returns {boolean} True if mobile device
   */
  isMobile() {
    const viewport = this.getViewportSize();
    return viewport.width < 768;
  },

  /**
   * Check if device is tablet
   * @returns {boolean} True if tablet device
   */
  isTablet() {
    const viewport = this.getViewportSize();
    return viewport.width >= 768 && viewport.width < 1024;
  },

  /**
   * Check if device is desktop
   * @returns {boolean} True if desktop device
   */
  isDesktop() {
    const viewport = this.getViewportSize();
    return viewport.width >= 1024;
  },

  /**
   * Scroll element into view smoothly
   * @param {HTMLElement} element - Element to scroll to
   * @param {Object} options - Scroll options
   */
  scrollIntoView(element, options = {}) {
    try {
      if (element && typeof element.scrollIntoView === "function") {
        const defaultOptions = {
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        };
        element.scrollIntoView({ ...defaultOptions, ...options });
      }
    } catch (error) {
      console.warn("Error scrolling into view:", error);
    }
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  async copyToClipboard(text) {
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.warn("Error copying to clipboard:", error);
      return false;
    }
  },

  /**
   * Store data in localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} True if successful
   */
  setLocalStorage(key, value) {
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Error setting localStorage:", error);
      return false;
    }
  },

  /**
   * Retrieve data from localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Retrieved value or default
   */
  getLocalStorage(key, defaultValue = null) {
    try {
      if (typeof Storage !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.warn("Error getting localStorage:", error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  removeLocalStorage(key) {
    try {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Error removing localStorage:", error);
      return false;
    }
  },

  /**
   * Log message with timestamp
   * @param {string} message - Message to log
   * @param {string} level - Log level ('info', 'warn', 'error')
   */
  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    switch (level) {
      case "warn": {
        console.warn(logMessage);
        break;
      }
      case "error": {
        console.error(logMessage);
        break;
      }
      default: {
        console.log(logMessage);
      }
    }
  },
};

// Make Utils globally available
window.Utils = Utils;
