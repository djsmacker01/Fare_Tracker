/**
 * Fare Tracker - Main Application Controller
 * Description: Core application logic and state management
 * Author: Your Name
 * Created: 2024
 *
 * This file handles:
 * - Application initialization
 * - State management
 * - Tab navigation
 * - Mobile menu functionality
 * - Event coordination between modules
 */

"use strict";

/**
 * Main Application Class
 * Manages the overall application state and coordinates between modules
 */
class FareTrackerApp {
  constructor() {
    // Application state
    this.state = {
      currentTab: "dashboard",
      isTracking: false,
      selectedService: "uber",
      alertPrice: 25,
      fromLocation: "Downtown",
      toLocation: "Airport",
      currentFares: {
        uber: 28.5,
        bolt: 26.8,
        taxi: 32.0,
      },
      contextData: {
        weather: "Clear",
        traffic: "Moderate",
        events: "Concert at Madison Square (8 PM)",
        demand: "High",
      },
      alerts: [],
      recommendations: [],
      insights: [],
    };

    // Tracking intervals
    this.trackingInterval = null;
    this.insightInterval = null;

    // Initialize application
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    try {
      this.showLoadingOverlay(true);

      // Wait for DOM to be fully loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.setupApplication();
        });
      } else {
        this.setupApplication();
      }
    } catch (error) {
      console.error("Error initializing application:", error);
      this.handleError("Failed to initialize application");
    }
  }

  /**
   * Setup application after DOM is ready
   */
  setupApplication() {
    try {
      // Setup event listeners
      this.setupEventListeners();

      // Initialize modules
      this.initializeModules();

      // Setup navigation
      this.setupNavigation();

      // Setup mobile menu
      this.setupMobileMenu();

      // Load initial data
      this.loadInitialData();

      // Setup accessibility
      this.setupAccessibility();

      // Hide loading overlay
      setTimeout(() => {
        this.showLoadingOverlay(false);
      }, 1500);
    } catch (error) {
      console.error("Error setting up application:", error);
      this.handleError("Failed to setup application");
    }
  }

  /**
   * Setup event listeners for core functionality
   */
  setupEventListeners() {
    // Route form validation
    const routeForm = document.getElementById("route-form");
    if (routeForm) {
      const fromInput = document.getElementById("from-location");
      const toInput = document.getElementById("to-location");

      if (fromInput && toInput) {
        fromInput.addEventListener("input", (e) =>
          this.handleLocationInput(e, "from")
        );
        toInput.addEventListener("input", (e) =>
          this.handleLocationInput(e, "to")
        );
        fromInput.addEventListener("blur", (e) =>
          this.validateLocationInput(e, "from")
        );
        toInput.addEventListener("blur", (e) =>
          this.validateLocationInput(e, "to")
        );
      }
    }

    // Tracking button
    const trackingBtn = document.getElementById("tracking-btn");
    if (trackingBtn) {
      trackingBtn.addEventListener("click", () => this.toggleTracking());
    }

    // Fare card selection
    const fareCards = document.querySelectorAll(".fare-card");
    fareCards.forEach((card) => {
      card.addEventListener("click", () =>
        this.selectService(card.dataset.service)
      );
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectService(card.dataset.service);
        }
      });
    });

    // Alert price input
    const alertPriceInput = document.getElementById("alert-price");
    if (alertPriceInput) {
      alertPriceInput.addEventListener("input", (e) =>
        this.handleAlertPriceChange(e)
      );
    }

    // Window resize handler
    window.addEventListener(
      "resize",
      Utils.debounce(() => {
        this.handleResize();
      }, 250)
    );

    // Keyboard navigation
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardNavigation(e)
    );

    // Visibility change (for pausing tracking when tab is hidden)
    document.addEventListener("visibilitychange", () =>
      this.handleVisibilityChange()
    );
  }

  /**
   * Initialize application modules
   */
  initializeModules() {
    try {
      // Initialize chart configurations
      if (typeof ChartConfig !== "undefined") {
        ChartConfig.init();
      }

      // Initialize AI Assistant
      if (typeof AIAssistant !== "undefined") {
        window.aiAssistant = new AIAssistant();
      }

      // Initialize Fare Tracker
      if (typeof FareTracker !== "undefined") {
        window.fareTracker = new FareTracker(this.state);
      }
    } catch (error) {
      console.error("Error initializing modules:", error);
    }
  }

  /**
   * Setup tab navigation
   */
  setupNavigation() {
    const navTabs = document.querySelectorAll(".nav-tab");
    const tabContents = document.querySelectorAll(".tab-content");

    navTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  /**
   * Switch between application tabs
   * @param {string} tabName - Name of the tab to switch to
   */
  switchTab(tabName) {
    try {
      // Update state
      this.state.currentTab = tabName;

      // Update navigation
      const navTabs = document.querySelectorAll(".nav-tab");
      const tabContents = document.querySelectorAll(".tab-content");

      navTabs.forEach((tab) => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive);
      });

      tabContents.forEach((content) => {
        const isActive = content.id === `${tabName}-content`;
        content.classList.toggle("active", isActive);
      });

      // Tab-specific initialization
      this.handleTabSwitch(tabName);

      // Close mobile menu if open
      this.closeMobileMenu();
    } catch (error) {
      console.error("Error switching tabs:", error);
    }
  }

  /**
   * Handle tab-specific initialization
   * @param {string} tabName - Name of the active tab
   */
  handleTabSwitch(tabName) {
    switch (tabName) {
      case "dashboard":
        this.refreshDashboard();
        break;
      case "ai-chat":
        if (window.aiAssistant) {
          window.aiAssistant.focusInput();
        }
        break;
      case "workflows":
        this.refreshWorkflowData();
        break;
    }
  }

  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        const isOpen = mobileMenuBtn.getAttribute("aria-expanded") === "true";
        this.toggleMobileMenu(!isOpen);
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeMobileMenu();
        }
      });
    }
  }

  /**
   * Toggle mobile menu
   * @param {boolean} isOpen - Whether to open or close the menu
   */
  toggleMobileMenu(isOpen) {
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.setAttribute("aria-expanded", isOpen);
      navMenu.classList.toggle("active", isOpen);

      // Manage focus
      if (isOpen) {
        const firstTab = navMenu.querySelector(".nav-tab");
        if (firstTab) firstTab.focus();
      }
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.toggleMobileMenu(false);
  }

  /**
   * Load initial data and setup
   */
  loadInitialData() {
    try {
      // Update UI with initial state
      this.updateLocationInputs();
      this.updateFareCards();
      this.updateContextIndicators();
      this.updateAlertSetup();
      this.generateInitialRecommendations();
      this.generateInitialInsight();

      // Initialize charts if chart module is available
      if (typeof ChartConfig !== "undefined") {
        setTimeout(() => {
          ChartConfig.initializeCharts();
          this.updateCharts();
        }, 500);
      }

      // Setup workflows data
      this.setupWorkflowData();
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add skip link functionality
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("main-content");
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Setup ARIA live regions
    this.setupLiveRegions();

    // Add keyboard navigation helpers
    this.setupKeyboardNavigation();
  }

  /**
   * Setup ARIA live regions for dynamic content updates
   */
  setupLiveRegions() {
    // Price changes
    const fareCards = document.querySelectorAll(".fare-card");
    fareCards.forEach((card) => {
      const priceElement = card.querySelector(".fare-price");
      const changeElement = card.querySelector(".price-change");
      if (priceElement) priceElement.setAttribute("aria-live", "polite");
      if (changeElement) changeElement.setAttribute("aria-live", "polite");
    });

    // Alert status
    const alertStatus = document.getElementById("alert-status");
    if (alertStatus) {
      alertStatus.setAttribute("aria-live", "polite");
    }
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Tab navigation with arrow keys
    const navTabs = document.querySelectorAll(".nav-tab");
    navTabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (e) => {
        let targetIndex;
        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            targetIndex = (index + 1) % navTabs.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            targetIndex = (index - 1 + navTabs.length) % navTabs.length;
            break;
          case "Home":
            e.preventDefault();
            targetIndex = 0;
            break;
          case "End":
            e.preventDefault();
            targetIndex = navTabs.length - 1;
            break;
        }

        if (targetIndex !== undefined) {
          navTabs[targetIndex].focus();
        }
      });
    });
  }

  /**
   * Handle location input changes
   * @param {Event} event - Input event
   * @param {string} type - 'from' or 'to'
   */
  handleLocationInput(event, type) {
    const value = event.target.value.trim();

    if (type === "from") {
      this.state.fromLocation = value;
    } else {
      this.state.toLocation = value;
    }

    // Clear any existing error
    this.clearInputError(event.target);

    // Update route display in fare cards
    this.updateRouteDisplay();
  }

  /**
   * Validate location input
   * @param {Event} event - Blur event
   * @param {string} type - 'from' or 'to'
   */
  validateLocationInput(event, type) {
    const input = event.target;
    const value = input.value.trim();

    if (!value) {
      this.showInputError(
        input,
        `Please enter ${type === "from" ? "pickup" : "destination"} location`
      );
      return false;
    }

    if (value.length < 2) {
      this.showInputError(input, "Location must be at least 2 characters");
      return false;
    }

    this.clearInputError(input);
    return true;
  }

  /**
   * Show input validation error
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  showInputError(input, message) {
    const errorElement = document.getElementById(
      input.getAttribute("aria-describedby")
    );
    if (errorElement) {
      errorElement.textContent = message;
      input.setAttribute("aria-invalid", "true");
      input.classList.add("error");
    }
  }

  /**
   * Clear input validation error
   * @param {HTMLElement} input - Input element
   */
  clearInputError(input) {
    const errorElement = document.getElementById(
      input.getAttribute("aria-describedby")
    );
    if (errorElement) {
      errorElement.textContent = "";
      input.setAttribute("aria-invalid", "false");
      input.classList.remove("error");
    }
  }

  /**
   * Toggle fare tracking
   */
  toggleTracking() {
    this.state.isTracking = !this.state.isTracking;

    const trackingBtn = document.getElementById("tracking-btn");
    const btnText = trackingBtn.querySelector(".btn-text");
    const btnIcon = trackingBtn.querySelector(".btn-icon");

    if (this.state.isTracking) {
      trackingBtn.classList.add("active");
      trackingBtn.setAttribute("aria-pressed", "true");
      btnText.textContent = "Stop AI Tracking";
      btnIcon.textContent = "⏹️";
      this.startTracking();
    } else {
      trackingBtn.classList.remove("active");
      trackingBtn.setAttribute("aria-pressed", "false");
      btnText.textContent = "Start AI Tracking";
      btnIcon.textContent = "▶️";
      this.stopTracking();
    }
  }

  /**
   * Start fare tracking
   */
  startTracking() {
    // Start price update interval
    this.trackingInterval = setInterval(() => {
      this.updateFares();
    }, 3000);

    // Start insight generation interval
    this.insightInterval = setInterval(() => {
      this.generateRandomInsight();
    }, 15000);

    // Update AI predictions in fare cards
    this.updateAIPredictions();

    // Generate initial recommendations
    this.generateRecommendations();
  }

  /**
   * Stop fare tracking
   */
  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    if (this.insightInterval) {
      clearInterval(this.insightInterval);
      this.insightInterval = null;
    }

    // Clear AI predictions
    this.clearAIPredictions();
  }

  /**
   * Update fare prices with simulated data
   */
  updateFares() {
    const services = ["uber", "bolt", "taxi"];
    const previousFares = { ...this.state.currentFares };

    services.forEach((service) => {
      const currentPrice = this.state.currentFares[service];
      const variation = (Math.random() - 0.5) * 4; // ±$2 variation
      const minPrice = service === "taxi" ? 20 : 15;

      this.state.currentFares[service] = Math.max(
        minPrice,
        currentPrice + variation
      );
    });

    // Update UI
    this.updateFareCards();
    this.updatePriceChanges(previousFares);
    this.checkAlerts();

    // Update charts if available
    if (typeof ChartConfig !== "undefined") {
      this.updateCharts();
    }
  }

  /**
   * Update fare cards display
   */
  updateFareCards() {
    const services = ["uber", "bolt", "taxi"];

    services.forEach((service) => {
      const priceElement = document.getElementById(`${service}-price`);
      if (priceElement) {
        priceElement.textContent = Utils.formatPrice(
          this.state.currentFares[service]
        );
      }
    });
  }

  /**
   * Update price change indicators
   * @param {Object} previousFares - Previous fare prices
   */
  updatePriceChanges(previousFares) {
    const services = ["uber", "bolt", "taxi"];

    services.forEach((service) => {
      const changeElement = document.getElementById(`${service}-change`);
      if (changeElement) {
        const current = this.state.currentFares[service];
        const previous = previousFares[service];
        const change = ((current - previous) / previous) * 100;

        const changeIcon = changeElement.querySelector(".change-icon");
        const changeText = changeElement.querySelector(".change-text");

        if (Math.abs(change) > 0.1) {
          changeIcon.textContent = change > 0 ? "📈" : "📉";
          changeText.textContent = `${change > 0 ? "+" : ""}${change.toFixed(
            1
          )}%`;

          changeElement.classList.remove("positive", "negative");
          changeElement.classList.add(change > 0 ? "positive" : "negative");
        }
      }
    });
  }

  /**
   * Select a service
   * @param {string} service - Service name ('uber', 'bolt', 'taxi')
   */
  selectService(service) {
    this.state.selectedService = service;

    // Update fare card selection
    const fareCards = document.querySelectorAll(".fare-card");
    fareCards.forEach((card) => {
      card.classList.toggle("selected", card.dataset.service === service);
    });

    // Update alert setup
    this.updateAlertSetup();
  }

  /**
   * Handle alert price change
   * @param {Event} event - Input event
   */
  handleAlertPriceChange(event) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      this.state.alertPrice = value;
      this.checkAlerts();
    }
  }

  /**
   * Check for price alerts
   */
  checkAlerts() {
    const currentPrice = this.state.currentFares[this.state.selectedService];
    const alertStatus = document.getElementById("alert-status");

    if (currentPrice <= this.state.alertPrice && this.state.isTracking) {
      // Generate alert
      const newAlert = {
        id: Date.now(),
        service: this.state.selectedService,
        price: currentPrice,
        time: new Date().toLocaleTimeString(),
        aiContext: this.generateAlertContext(),
        confidence: Math.floor(Math.random() * 30) + 70,
      };

      this.state.alerts.unshift(newAlert);
      this.state.alerts = this.state.alerts.slice(0, 5); // Keep only 5 recent alerts

      // Update UI
      this.updateAlertsDisplay();

      // Update status
      if (alertStatus) {
        alertStatus.classList.add("active");
        alertStatus.querySelector(".status-icon").textContent = "🎉";
        alertStatus.querySelector(".status-text").textContent =
          "AI Alert: Price target reached!";
      }

      // Send to AI assistant if available
      if (window.aiAssistant) {
        window.aiAssistant.addMessage(
          `🎯 Price alert triggered! ${
            this.state.selectedService
          } is now ${Utils.formatPrice(currentPrice)}. ${newAlert.aiContext}`,
          "ai"
        );
      }
    } else {
      // Update status
      if (alertStatus) {
        alertStatus.classList.remove("active");
        alertStatus.querySelector(".status-icon").textContent = "⏳";
        alertStatus.querySelector(".status-text").textContent =
          "AI monitoring for optimal pricing...";
      }
    }
  }

  /**
   * Generate AI context for alerts
   * @returns {string} AI context message
   */
  generateAlertContext() {
    const contexts = [
      "AI predicts this is the lowest price for the next 2 hours",
      "Good deal detected! Prices typically 20% higher at this time",
      "Optimal booking window identified by machine learning",
      "Price drop triggered by decreased demand analysis",
      "Perfect timing based on historical patterns",
    ];

    return contexts[Math.floor(Math.random() * contexts.length)];
  }

  /**
   * Update location inputs with current state
   */
  updateLocationInputs() {
    const fromInput = document.getElementById("from-location");
    const toInput = document.getElementById("to-location");

    if (fromInput) fromInput.value = this.state.fromLocation;
    if (toInput) toInput.value = this.state.toLocation;

    this.updateRouteDisplay();
  }

  /**
   * Update route display in fare cards
   */
  updateRouteDisplay() {
    const route = `${this.state.fromLocation} → ${this.state.toLocation}`;
    const routeElements = document.querySelectorAll(".route-display");

    routeElements.forEach((element) => {
      element.textContent = route;
    });
  }

  /**
   * Update context indicators
   */
  updateContextIndicators() {
    const indicators = {
      weather: document.getElementById("weather-status"),
      traffic: document.getElementById("traffic-status"),
      event: document.getElementById("event-status"),
      demand: document.getElementById("demand-status"),
    };

    if (indicators.weather)
      indicators.weather.textContent = this.state.contextData.weather;
    if (indicators.traffic)
      indicators.traffic.textContent = this.state.contextData.traffic;
    if (indicators.event) indicators.event.textContent = "Concert";
    if (indicators.demand)
      indicators.demand.textContent = this.state.contextData.demand;
  }

  /**
   * Update alert setup display
   */
  updateAlertSetup() {
    const serviceNameElements = document.querySelectorAll(
      "#selected-service-name, #current-service-name"
    );
    const currentPriceElement = document.getElementById(
      "current-service-price"
    );

    const serviceName =
      this.state.selectedService.charAt(0).toUpperCase() +
      this.state.selectedService.slice(1);
    const currentPrice = this.state.currentFares[this.state.selectedService];

    serviceNameElements.forEach((element) => {
      element.textContent = serviceName;
    });

    if (currentPriceElement) {
      currentPriceElement.textContent = Utils.formatPrice(currentPrice);
    }
  }

  /**
   * Update alerts display
   */
  updateAlertsDisplay() {
    const alertsList = document.getElementById("alerts-list");
    const noAlertsMessage = document.getElementById("no-alerts");

    if (!alertsList) return;

    if (this.state.alerts.length === 0) {
      if (noAlertsMessage) noAlertsMessage.style.display = "block";
      return;
    }

    if (noAlertsMessage) noAlertsMessage.style.display = "none";

    // Clear existing alerts except no-alerts message
    const existingAlerts = alertsList.querySelectorAll(".alert-item");
    existingAlerts.forEach((alert) => alert.remove());

    // Add new alerts
    this.state.alerts.forEach((alert) => {
      const alertElement = this.createAlertElement(alert);
      alertsList.appendChild(alertElement);
    });
  }

  /**
   * Create alert element
   * @param {Object} alert - Alert data
   * @returns {HTMLElement} Alert element
   */
  createAlertElement(alert) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert-item";
    alertDiv.innerHTML = `
            <div class="alert-header">
                <div class="alert-service">
                    <span class="service-icon" aria-hidden="true">🔔</span>
                    <span class="service-name">${
                      alert.service.charAt(0).toUpperCase() +
                      alert.service.slice(1)
                    }</span>
                    <span class="alert-action">price dropped</span>
                </div>
                <div class="alert-details">
                    <div class="alert-price">${Utils.formatPrice(
                      alert.price
                    )}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
            ${
              alert.aiContext
                ? `<div class="alert-context">AI: ${alert.aiContext} (${alert.confidence}% confidence)</div>`
                : ""
            }
        `;

    return alertDiv;
  }

  /**
   * Generate initial recommendations
   */
  generateInitialRecommendations() {
    const recommendations = [
      {
        id: 1,
        type: "timing",
        title: "Optimal Departure Time",
        description: "Leave in 15 minutes for 20% savings",
        impact: "$6.50 savings",
        confidence: 87,
      },
      {
        id: 2,
        type: "service",
        title: "Service Switch Recommendation",
        description: "Bolt is 15% cheaper with same ETA",
        impact: "$4.20 savings",
        confidence: 92,
      },
    ];

    this.state.recommendations = recommendations;
    this.updateRecommendationsDisplay();
  }

  /**
   * Generate new recommendations based on current data
   */
  generateRecommendations() {
    if (!this.state.isTracking) return;

    const recommendations = [];
    const currentPrice = this.state.currentFares[this.state.selectedService];

    // Time-based recommendation
    if (Math.random() > 0.5) {
      const waitTime = Math.floor(Math.random() * 30) + 5;
      const savings = Math.floor(Math.random() * 10) + 3;
      recommendations.push({
        id: Date.now(),
        type: "timing",
        title: "Wait for Better Price",
        description: `Wait ${waitTime} minutes for potential savings`,
        impact: `$${savings}.00 potential savings`,
        confidence: Math.floor(Math.random() * 20) + 75,
      });
    }

    // Service recommendation
    const services = Object.keys(this.state.currentFares);
    const cheapestService = services.reduce((a, b) =>
      this.state.currentFares[a] < this.state.currentFares[b] ? a : b
    );

    if (cheapestService !== this.state.selectedService) {
      const savings = currentPrice - this.state.currentFares[cheapestService];
      if (savings > 1) {
        recommendations.push({
          id: Date.now() + 1,
          type: "service",
          title: "Switch Service",
          description: `${
            cheapestService.charAt(0).toUpperCase() + cheapestService.slice(1)
          } is cheaper right now`,
          impact: `$${savings.toFixed(2)} savings`,
          confidence: Math.floor(Math.random() * 15) + 85,
        });
      }
    }

    this.state.recommendations = recommendations;
    this.updateRecommendationsDisplay();
  }

  /**
   * Update recommendations display
   */
  updateRecommendationsDisplay() {
    const recommendationsList = document.getElementById("recommendations-list");
    const recommendationsSection = document.getElementById(
      "recommendations-section"
    );

    if (!recommendationsList) return;

    if (this.state.recommendations.length === 0) {
      if (recommendationsSection) {
        recommendationsSection.style.display = "none";
      }
      return;
    }

    if (recommendationsSection) {
      recommendationsSection.style.display = "block";
    }

    recommendationsList.innerHTML = "";

    this.state.recommendations.forEach((rec) => {
      const recElement = this.createRecommendationElement(rec);
      recommendationsList.appendChild(recElement);
    });
  }

  /**
   * Create recommendation element
   * @param {Object} rec - Recommendation data
   * @returns {HTMLElement} Recommendation element
   */
  createRecommendationElement(rec) {
    const recDiv = document.createElement("div");
    recDiv.className = "recommendation-item";
    recDiv.setAttribute("role", "listitem");

    recDiv.innerHTML = `
            <div class="recommendation-content">
                <h3 class="recommendation-title">${rec.title}</h3>
                <p class="recommendation-description">${rec.description}</p>
                <div class="recommendation-impact">
                    <span class="impact-savings">${rec.impact}</span>
                    <span class="impact-confidence">• ${rec.confidence}% confidence</span>
                </div>
            </div>
            <button class="apply-btn" onclick="app.applyRecommendation(${rec.id})">Apply</button>
        `;

    return recDiv;
  }

  /**
   * Apply a recommendation
   * @param {number} recId - Recommendation ID
   */
  applyRecommendation(recId) {
    const recommendation = this.state.recommendations.find(
      (rec) => rec.id === recId
    );
    if (!recommendation) return;

    // Simulate applying recommendation
    const messages = [
      "Recommendation applied! Monitoring for optimal timing...",
      "Settings updated based on AI recommendation.",
      "Great choice! This should save you money.",
      "Recommendation activated. You'll be notified when conditions are met.",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    if (window.aiAssistant) {
      window.aiAssistant.addMessage(message, "ai");
    }

    // Remove applied recommendation
    this.state.recommendations = this.state.recommendations.filter(
      (rec) => rec.id !== recId
    );
    this.updateRecommendationsDisplay();
  }

  /**
   * Generate initial AI insight
   */
  generateInitialInsight() {
    const insights = [
      { message: "Analyzing current market conditions...", priority: "medium" },
      {
        message: "AI systems initialized and monitoring prices",
        priority: "low",
      },
      {
        message: "Historical data suggests 15% price drop likely in next hour",
        priority: "high",
      },
    ];

    const insight = insights[Math.floor(Math.random() * insights.length)];
    this.updateInsightBanner(insight.message, insight.priority);
  }

  /**
   * Generate random AI insight
   */
  generateRandomInsight() {
    if (!this.state.isTracking) return;

    const insights = [
      {
        message: "Uber prices dropped 12% - good time to book!",
        priority: "high",
      },
      {
        message: "Rain expected in 30 min - demand will increase",
        priority: "medium",
      },
      { message: "Wait 15 minutes for potential 8% savings", priority: "low" },
      {
        message: "Alternative route available - saves 5 minutes",
        priority: "medium",
      },
      {
        message: "Concert traffic detected - prices rising downtown",
        priority: "high",
      },
      {
        message: "AI detected optimal booking window in 5 minutes",
        priority: "high",
      },
      {
        message: "Demand patterns suggest price stabilization",
        priority: "low",
      },
    ];

    const insight = insights[Math.floor(Math.random() * insights.length)];
    this.updateInsightBanner(insight.message, insight.priority);

    // Add to insights history
    this.state.insights.unshift({
      id: Date.now(),
      ...insight,
      timestamp: new Date().toLocaleTimeString(),
    });
    this.state.insights = this.state.insights.slice(0, 10);
  }

  /**
   * Update AI insights banner
   * @param {string} message - Insight message
   * @param {string} priority - Priority level ('low', 'medium', 'high')
   */
  updateInsightBanner(message, priority) {
    const insightMessage = document.getElementById("insight-message");
    const insightPriority = document.getElementById("insight-priority");

    if (insightMessage) insightMessage.textContent = message;
    if (insightPriority) {
      insightPriority.textContent = priority.toUpperCase();
      insightPriority.className = `insight-priority priority-${priority}`;
    }
  }

  /**
   * Update AI predictions in fare cards
   */
  updateAIPredictions() {
    const services = ["uber", "bolt", "taxi"];
    const predictions = [
      "AI: Expected to rise",
      "AI: May drop soon",
      "AI: Stable pricing",
      "AI: Surge likely",
      "AI: Good value now",
    ];

    services.forEach((service) => {
      const predictionElement = document.getElementById(
        `${service}-prediction`
      );
      if (predictionElement) {
        const prediction =
          predictions[Math.floor(Math.random() * predictions.length)];
        predictionElement.textContent = prediction;
        predictionElement.style.display = "block";
      }
    });
  }

  /**
   * Clear AI predictions
   */
  clearAIPredictions() {
    const services = ["uber", "bolt", "taxi"];
    services.forEach((service) => {
      const predictionElement = document.getElementById(
        `${service}-prediction`
      );
      if (predictionElement) {
        predictionElement.style.display = "none";
      }
    });
  }

  /**
   * Update charts with current data
   */
  updateCharts() {
    if (typeof ChartConfig !== "undefined") {
      ChartConfig.updatePriceChart(this.state.currentFares);
      ChartConfig.updateDemandChart();
    }
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard() {
    this.updateFareCards();
    this.updateContextIndicators();
    this.updateRecommendationsDisplay();
    this.updateAlertsDisplay();
  }

  /**
   * Setup workflow data
   */
  setupWorkflowData() {
    this.updateWorkflowStatus();
    this.updatePerformanceMetrics();
    this.updateAPIIntegrations();
  }

  /**
   * Update workflow status display
   */
  updateWorkflowStatus() {
    // Workflow status is static for demo purposes
    // In a real application, this would fetch actual n8n workflow data
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    // Performance metrics are simulated
    // In a real application, this would fetch actual metrics
  }

  /**
   * Update API integrations display
   */
  updateAPIIntegrations() {
    const apiGrid = document.querySelector(".api-grid");
    if (!apiGrid) return;

    const apis = [
      { name: "Uber API", status: "active", calls: "1.2k" },
      { name: "Lyft API", status: "active", calls: "987" },
      { name: "Weather API", status: "active", calls: "145" },
      { name: "Traffic API", status: "active", calls: "423" },
      { name: "Events API", status: "active", calls: "67" },
      { name: "OpenAI API", status: "active", calls: "234" },
      { name: "Calendar API", status: "active", calls: "89" },
      { name: "Maps API", status: "active", calls: "678" },
    ];

    apiGrid.innerHTML = "";

    apis.forEach((api) => {
      const apiElement = document.createElement("div");
      apiElement.className = "api-item";
      apiElement.innerHTML = `
                <div class="api-name">${api.name}</div>
                <div class="api-status">
                    <div class="api-indicator ${api.status}"></div>
                    <span class="api-calls">${api.calls} calls</span>
                </div>
            `;
      apiGrid.appendChild(apiElement);
    });
  }

  /**
   * Refresh workflow data
   */
  refreshWorkflowData() {
    this.updateWorkflowStatus();
    this.updatePerformanceMetrics();
    this.updateAPIIntegrations();
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    // Global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "1":
          event.preventDefault();
          this.switchTab("dashboard");
          break;
        case "2":
          event.preventDefault();
          this.switchTab("ai-chat");
          break;
        case "3":
          event.preventDefault();
          this.switchTab("workflows");
          break;
      }
    }

    // Escape key handling
    if (event.key === "Escape") {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Update charts on resize
    if (typeof ChartConfig !== "undefined") {
      ChartConfig.handleResize();
    }

    // Close mobile menu on desktop resize
    if (window.innerWidth >= 768) {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle visibility change (tab focus/blur)
   */
  handleVisibilityChange() {
    if (document.hidden && this.state.isTracking) {
      // Reduce tracking frequency when tab is hidden
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = setInterval(() => {
          this.updateFares();
        }, 10000); // Update every 10 seconds instead of 3
      }
    } else if (!document.hidden && this.state.isTracking) {
      // Resume normal tracking frequency
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = setInterval(() => {
          this.updateFares();
        }, 3000);
      }
    }
  }

  /**
   * Show/hide loading overlay
   * @param {boolean} show - Whether to show the overlay
   */
  showLoadingOverlay(show) {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.setAttribute("aria-hidden", !show);
    }
  }

  /**
   * Handle application errors
   * @param {string} message - Error message
   */
  handleError(message) {
    console.error("Application Error:", message);

    // Show error to user (in a real app, you might use a toast notification)
    if (window.aiAssistant) {
      window.aiAssistant.addMessage(`❌ Error: ${message}`, "system");
    }
  }

  /**
   * Cleanup method for when the app is destroyed
   */
  destroy() {
    // Clear intervals
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    if (this.insightInterval) {
      clearInterval(this.insightInterval);
    }

    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
    document.removeEventListener("keydown", this.handleKeyboardNavigation);
  }
}

// Initialize application when DOM is ready
let app;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    app = new FareTrackerApp();
  });
} else {
  app = new FareTrackerApp();
}

// Make app globally accessible for debugging
window.app = app;
