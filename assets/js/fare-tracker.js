class FareTracker {
  constructor() {
    this.isTracking = false;
    this.trackingInterval = null;
    this.alertPrice = 25;
    this.selectedService = "uber";
    this.fromLocation = "Downtown";
    this.toLocation = "Airport";

    // Current fare data
    this.currentFares = {
      uber: 28.5,
      bolt: 26.8,
      taxi: 32.0,
    };

    // Historical data
    this.priceHistory = [];
    this.alerts = [];
    this.recommendations = [];
    this.insights = [];

    // Service configurations
    this.services = [
      {
        id: "uber",
        name: "Uber",
        color: "#000000",
        icon: "car",
        basePrice: 25,
        surgeMultiplier: 1.0,
      },
      {
        id: "bolt",
        name: "Bolt",
        color: "#34C759",
        icon: "navigation",
        basePrice: 23,
        surgeMultiplier: 0.9,
      },
      {
        id: "taxi",
        name: "Taxi",
        color: "#FF9500",
        icon: "car",
        basePrice: 30,
        surgeMultiplier: 1.1,
      },
    ];

    // Context data for AI predictions
    this.contextData = {
      weather: "Clear",
      traffic: "Moderate",
      events: "Concert at Madison Square (8 PM)",
      demand: "High",
      timeOfDay: "peak",
      dayOfWeek: "weekday",
    };

    // Peak hours data
    this.peakHoursData = [
      { hour: "6AM", demand: 30, avgPrice: 22, efficiency: 85 },
      { hour: "7AM", demand: 85, avgPrice: 35, efficiency: 45 },
      { hour: "8AM", demand: 95, avgPrice: 42, efficiency: 25 },
      { hour: "9AM", demand: 70, avgPrice: 30, efficiency: 60 },
      { hour: "10AM", demand: 40, avgPrice: 25, efficiency: 90 },
      { hour: "11AM", demand: 45, avgPrice: 28, efficiency: 85 },
      { hour: "12PM", demand: 60, avgPrice: 32, efficiency: 70 },
      { hour: "1PM", demand: 55, avgPrice: 30, efficiency: 75 },
    ];

    this.initializeHistoricalData();
    this.bindEvents();
    this.loadSavedData();

    Utils.Logger.info("FareTracker initialized");
  }

  /**
   * Initialize historical price data
   */
  initializeHistoricalData() {
    this.priceHistory = [
      { time: "6:00", uber: 22, bolt: 20, taxi: 28, predicted: 24 },
      { time: "7:00", uber: 35, bolt: 32, taxi: 40, predicted: 34 },
      { time: "8:00", uber: 42, bolt: 38, taxi: 45, predicted: 40 },
      { time: "9:00", uber: 30, bolt: 28, taxi: 35, predicted: 29 },
      { time: "10:00", uber: 25, bolt: 23, taxi: 30, predicted: 25 },
      { time: "11:00", uber: 28, bolt: 26, taxi: 32, predicted: 27 },
      { time: "12:00", uber: 32, bolt: 30, taxi: 36, predicted: 31 },
    ];
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Location inputs
    const fromInput = Utils.DOM.get("from-location");
    const toInput = Utils.DOM.get("to-location");

    if (fromInput) {
      fromInput.addEventListener("change", (e) => {
        this.fromLocation = e.target.value;
        this.updateRoute();
      });
    }

    if (toInput) {
      toInput.addEventListener("change", (e) => {
        this.toLocation = e.target.value;
        this.updateRoute();
      });
    }

    // Alert price input
    const alertInput = Utils.DOM.get("alert-price");
    if (alertInput) {
      alertInput.addEventListener("change", (e) => {
        this.alertPrice = parseFloat(e.target.value);
        this.checkPriceAlerts();
        this.saveData();
      });
    }

    // Tracking toggle
    const trackingBtn = Utils.DOM.get("tracking-toggle");
    if (trackingBtn) {
      trackingBtn.addEventListener("click", () => {
        this.toggleTracking();
      });
    }
  }

  /**
   * Load saved data from localStorage
   */
  loadSavedData() {
    const savedData = Utils.StorageUtils.load("fareTracker", {});

    if (savedData.alertPrice) {
      this.alertPrice = savedData.alertPrice;
      const alertInput = Utils.DOM.get("alert-price");
      if (alertInput) alertInput.value = this.alertPrice;
    }

    if (savedData.selectedService) {
      this.selectedService = savedData.selectedService;
    }

    if (savedData.fromLocation) {
      this.fromLocation = savedData.fromLocation;
      const fromInput = Utils.DOM.get("from-location");
      if (fromInput) fromInput.value = this.fromLocation;
    }

    if (savedData.toLocation) {
      this.toLocation = savedData.toLocation;
      const toInput = Utils.DOM.get("to-location");
      if (toInput) toInput.value = this.toLocation;
    }

    if (savedData.alerts) {
      this.alerts = savedData.alerts;
    }
  }

  /**
   * Save current data to localStorage
   */
  saveData() {
    const dataToSave = {
      alertPrice: this.alertPrice,
      selectedService: this.selectedService,
      fromLocation: this.fromLocation,
      toLocation: this.toLocation,
      alerts: this.alerts,
    };

    Utils.StorageUtils.save("fareTracker", dataToSave);
  }

  /**
   * Toggle fare tracking
   */
  toggleTracking() {
    if (this.isTracking) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  /**
   * Start fare tracking
   */
  startTracking() {
    this.isTracking = true;

    // Update UI
    const trackingBtn = Utils.DOM.get("tracking-toggle");
    if (trackingBtn) {
      trackingBtn.textContent = "Stop AI Tracking";
      trackingBtn.className = "tracking-btn stop";
    }

    // Start tracking interval
    this.trackingInterval = setInterval(() => {
      this.updateFares();
      this.generateInsights();
    }, 3000);

    this.generateRecommendations();
    Utils.Logger.info("Fare tracking started");
  }

  /**
   * Stop fare tracking
   */
  stopTracking() {
    this.isTracking = false;

    // Update UI
    const trackingBtn = Utils.DOM.get("tracking-toggle");
    if (trackingBtn) {
      trackingBtn.textContent = "Start AI Tracking";
      trackingBtn.className = "tracking-btn start";
    }

    // Clear interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    Utils.Logger.info("Fare tracking stopped");
  }

  /**
   * Update fare prices with simulated data
   */
  updateFares() {
    const previousFares = { ...this.currentFares };

    // Simulate price changes based on context
    this.services.forEach((service) => {
      const basePrice = service.basePrice;
      const surge = this.calculateSurgeMultiplier(service.id);
      const randomVariation = Utils.NumberUtils.randomBetween(-3, 3);

      const newPrice = Math.max(15, basePrice * surge + randomVariation);
      this.currentFares[service.id] = Utils.NumberUtils.roundTo(newPrice, 2);
    });

    // Add to history
    const currentTime = Utils.DateUtils.getCurrentTime();
    this.priceHistory.push({
      time: currentTime,
      ...this.currentFares,
      predicted: this.predictNextPrice(),
    });

    // Keep only last 20 entries
    if (this.priceHistory.length > 20) {
      this.priceHistory.shift();
    }

    // Update UI
    this.updateFareCards(previousFares);
    this.checkPriceAlerts();

    // Update chart if it exists
    if (
      window.ChartManager &&
      window.ChartManager.charts.has("price-history-chart")
    ) {
      window.ChartManager.updateChart(
        "price-history-chart",
        [this.priceHistory[this.priceHistory.length - 1]],
        20
      );
    }
  }

  /**
   * Calculate surge multiplier based on context
   * @param {string} serviceId - Service ID
   * @returns {number} Surge multiplier
   */
  calculateSurgeMultiplier(serviceId) {
    let surge = 1.0;

    // Base surge for service
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      surge *= service.surgeMultiplier;
    }

    // Weather impact
    if (this.contextData.weather === "Rain") {
      surge *= 1.3;
    } else if (this.contextData.weather === "Snow") {
      surge *= 1.5;
    }

    // Traffic impact
    if (this.contextData.traffic === "Heavy") {
      surge *= 1.2;
    }

    // Event impact
    if (this.contextData.events !== "None") {
      surge *= 1.15;
    }

    // Demand impact
    if (this.contextData.demand === "High") {
      surge *= 1.1;
    } else if (this.contextData.demand === "Very High") {
      surge *= 1.25;
    }

    // Time of day impact
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      surge *= 1.2; // Rush hour
    }

    return surge;
  }

  /**
   * Predict next price using simple algorithm
   * @returns {number} Predicted price
   */
  predictNextPrice() {
    if (this.priceHistory.length < 3) {
      return this.currentFares[this.selectedService];
    }

    const recentPrices = this.priceHistory
      .slice(-3)
      .map((h) => h[this.selectedService]);
    const trend = (recentPrices[2] - recentPrices[0]) / 2;
    const current = this.currentFares[this.selectedService];

    // Add some randomness and context-based adjustments
    let prediction = current + trend;

    // Adjust based on context
    if (this.contextData.demand === "High") {
      prediction *= 1.05;
    } else if (this.contextData.demand === "Low") {
      prediction *= 0.95;
    }

    return Utils.NumberUtils.roundTo(Math.max(15, prediction), 2);
  }

  /**
   * Update fare cards in UI
   * @param {Object} previousFares - Previous fare prices
   */
  updateFareCards(previousFares) {
    const fareCardsContainer = Utils.DOM.get("fare-cards");
    if (!fareCardsContainer) return;

    fareCardsContainer.innerHTML = "";

    this.services.forEach((service) => {
      const currentPrice = this.currentFares[service.id];
      const previousPrice = previousFares[service.id];
      const priceChange = Utils.NumberUtils.calculatePercentageChange(
        currentPrice,
        previousPrice
      );

      const fareCard = Utils.DOM.create("div", {
        className: `fare-card ${
          this.selectedService === service.id ? "selected" : ""
        }`,
        dataset: { service: service.id },
      });

      fareCard.innerHTML = `
                <div class="fare-header">
                    <div class="service-info">
                        <i data-lucide="${service.icon}" style="color: ${
        service.color
      }"></i>
                        <span class="service-name">${service.name}</span>
                    </div>
                    ${
                      Math.abs(priceChange) > 0.1
                        ? `
                        <div class="price-change ${
                          priceChange > 0 ? "positive" : "negative"
                        }">
                            <i data-lucide="${
                              priceChange > 0 ? "trending-up" : "trending-down"
                            }"></i>
                            <span>${Math.abs(priceChange).toFixed(1)}%</span>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="fare-price">${Utils.NumberUtils.formatPrice(
                  currentPrice
                )}</div>
                <div class="fare-route">${this.fromLocation} → ${
        this.toLocation
      }</div>
                ${
                  this.isTracking
                    ? `
                    <div class="ai-prediction">
                        AI: ${
                          Math.random() > 0.5
                            ? "Expected to rise"
                            : "May drop soon"
                        }
                    </div>
                `
                    : ""
                }
            `;

      fareCard.addEventListener("click", () => {
        this.selectService(service.id);
      });

      fareCardsContainer.appendChild(fareCard);
    });

    // Reinitialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.updateCurrentPriceDisplay();
  }

  /**
   * Select a service
   * @param {string} serviceId - Service ID
   */
  selectService(serviceId) {
    this.selectedService = serviceId;

    // Update selected service display
    const selectedServiceSpan = Utils.DOM.get("selected-service");
    const currentServiceSpan = Utils.DOM.get("current-service");

    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      if (selectedServiceSpan) selectedServiceSpan.textContent = service.name;
      if (currentServiceSpan) currentServiceSpan.textContent = service.name;
    }

    // Update fare cards
    Utils.DOM.queryAll(".fare-card").forEach((card) => {
      Utils.DOM.removeClass(card, "selected");
      if (card.dataset.service === serviceId) {
        Utils.DOM.addClass(card, "selected");
      }
    });

    this.updateCurrentPriceDisplay();
    this.checkPriceAlerts();
    this.saveData();
  }

  /**
   * Update current price display
   */
  updateCurrentPriceDisplay() {
    const currentPriceSpan = Utils.DOM.get("current-price");
    if (currentPriceSpan) {
      const price = this.currentFares[this.selectedService];
      currentPriceSpan.textContent = Utils.NumberUtils.formatPrice(price);
    }
  }

  /**
   * Check price alerts
   */
  checkPriceAlerts() {
    const currentPrice = this.currentFares[this.selectedService];
    const alertStatus = Utils.DOM.get("alert-status");

    if (currentPrice <= this.alertPrice && this.isTracking) {
      // Price alert triggered
      const aiContext =
        Math.random() > 0.5
          ? "AI predicts this is the lowest price for the next 2 hours"
          : "Good deal detected! Prices typically 20% higher at this time";

      const newAlert = {
        id: Date.now(),
        service: this.selectedService,
        price: currentPrice,
        time: Utils.DateUtils.getCurrentTime(),
        aiContext: aiContext,
        confidence: Math.floor(Math.random() * 30) + 70,
      };

      this.alerts.unshift(newAlert);
      this.alerts = this.alerts.slice(0, 5); // Keep only last 5 alerts

      this.updateAlertsDisplay();
      this.saveData();

      // Update alert status
      if (alertStatus) {
        alertStatus.innerHTML = `
                    <i data-lucide="alert-circle"></i>
                    <span>🎉 AI Alert: Price target reached!</span>
                `;
        Utils.DOM.addClass(alertStatus, "triggered");
      }

      // Send notification to AI assistant
      if (window.AIAssistant) {
        window.AIAssistant.addMessage(
          `🎯 Price alert triggered! ${
            this.services.find((s) => s.id === this.selectedService)?.name
          } is now ${Utils.NumberUtils.formatPrice(
            currentPrice
          )}. ${aiContext}`,
          "ai"
        );
      }
    } else {
      // No alert
      if (alertStatus) {
        alertStatus.innerHTML = `
                    <i data-lucide="alert-circle"></i>
                    <span>AI monitoring for optimal pricing...</span>
                `;
        Utils.DOM.removeClass(alertStatus, "triggered");
      }
    }
  }

  /**
   * Update alerts display
   */
  updateAlertsDisplay() {
    const alertsList = Utils.DOM.get("alerts-list");
    if (!alertsList) return;

    if (this.alerts.length === 0) {
      alertsList.innerHTML = `
                <div class="no-alerts">
                    <i data-lucide="bell"></i>
                    <p>No alerts yet. Start AI tracking to receive intelligent notifications!</p>
                </div>
            `;
    } else {
      alertsList.innerHTML = this.alerts
        .map(
          (alert) => `
                <div class="alert-item">
                    <div class="alert-header">
                        <div class="alert-service">
                            <i data-lucide="bell"></i>
                            <span class="service-name">${alert.service}</span>
                            <span class="alert-text">price dropped</span>
                        </div>
                        <div class="alert-price-info">
                            <div class="alert-price">${Utils.NumberUtils.formatPrice(
                              alert.price
                            )}</div>
                            <div class="alert-time">${alert.time}</div>
                        </div>
                    </div>
                    ${
                      alert.aiContext
                        ? `
                        <div class="ai-context">
                            AI: ${alert.aiContext} (${alert.confidence}% confidence)
                        </div>
                    `
                        : ""
                    }
                </div>
            `
        )
        .join("");
    }

    // Reinitialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Generate AI recommendations
   */
  generateRecommendations() {
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

    this.recommendations = recommendations;
    this.updateRecommendationsDisplay();
  }

  /**
   * Update recommendations display
   */
  updateRecommendationsDisplay() {
    const recommendationsSection = Utils.DOM.get("ai-recommendations");
    const recommendationsList = Utils.DOM.get("recommendations-list");

    if (!recommendationsList) return;

    if (this.recommendations.length > 0) {
      Utils.DOM.show(recommendationsSection);

      recommendationsList.innerHTML = this.recommendations
        .map(
          (rec) => `
                <div class="recommendation-item">
                    <div class="recommendation-content">
                        <div class="recommendation-title">${rec.title}</div>
                        <div class="recommendation-description">${rec.description}</div>
                        <div class="recommendation-meta">
                            <span class="impact">${rec.impact}</span>
                            <span class="confidence">• ${rec.confidence}% confidence</span>
                        </div>
                    </div>
                    <button class="apply-btn" onclick="fareTracker.applyRecommendation(${rec.id})">
                        Apply
                    </button>
                </div>
            `
        )
        .join("");
    } else {
      Utils.DOM.hide(recommendationsSection);
    }
  }

  /**
   * Apply recommendation
   * @param {number} recommendationId - Recommendation ID
   */
  applyRecommendation(recommendationId) {
    const recommendation = this.recommendations.find(
      (r) => r.id === recommendationId
    );
    if (!recommendation) return;

    // Simulate applying the recommendation
    if (recommendation.type === "service") {
      // Switch to recommended service (in this case, Bolt)
      this.selectService("bolt");
    }

    // Show success feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = "Applied ✓";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);

    Utils.Logger.info("Recommendation applied:", recommendation.title);
  }

  /**
   * Generate AI insights
   */
  generateInsights() {
    if (Math.random() > 0.7) {
      const insights = [
        {
          type: "price_drop",
          message: "Uber prices dropped 12% - good time to book!",
          priority: "high",
        },
        {
          type: "weather",
          message: "Rain expected in 30 min - demand will increase",
          priority: "medium",
        },
        {
          type: "optimization",
          message: "Wait 15 minutes for potential 8% savings",
          priority: "low",
        },
        {
          type: "traffic",
          message: "Alternative route available - saves 5 minutes",
          priority: "medium",
        },
        {
          type: "event",
          message: "Concert traffic detected - prices rising in downtown",
          priority: "high",
        },
      ];

      const newInsight = {
        id: Date.now(),
        ...Utils.ArrayUtils.randomItem(insights),
        timestamp: Utils.DateUtils.getCurrentTime(),
      };

      this.insights.unshift(newInsight);
      this.insights = this.insights.slice(0, 5); // Keep only last 5 insights

      this.updateInsightDisplay();
    }
  }

  /**
   * Update AI insight display
   */
  updateInsightDisplay() {
    if (this.insights.length === 0) return;

    const insightBanner = Utils.DOM.get("ai-insights-banner");
    const insightMessage = Utils.DOM.get("insight-message");
    const insightPriority = Utils.DOM.get("insight-priority");

    if (insightBanner && insightMessage && insightPriority) {
      const latestInsight = this.insights[0];

      insightMessage.textContent = latestInsight.message;
      insightPriority.textContent = latestInsight.priority.toUpperCase();
      insightPriority.className = `priority-badge ${latestInsight.priority}`;

      Utils.DOM.show(insightBanner);
    }
  }

  /**
   * Update route information
   */
  updateRoute() {
    // Update fare cards with new route
    this.updateFareCards({ ...this.currentFares });

    // Simulate route-based price adjustments
    const routeMultiplier = this.calculateRouteMultiplier();
    this.services.forEach((service) => {
      this.currentFares[service.id] *= routeMultiplier;
      this.currentFares[service.id] = Utils.NumberUtils.roundTo(
        this.currentFares[service.id],
        2
      );
    });

    this.saveData();
    Utils.Logger.info(
      "Route updated:",
      this.fromLocation,
      "→",
      this.toLocation
    );
  }

  /**
   * Calculate route-based multiplier
   * @returns {number} Route multiplier
   */
  calculateRouteMultiplier() {
    // Simple distance-based pricing simulation
    const routeMultipliers = {
      "Downtown → Airport": 1.2,
      "Airport → Downtown": 1.1,
      "Downtown → Stadium": 0.9,
      "Stadium → Downtown": 0.8,
      "Airport → Stadium": 1.5,
    };

    const route = `${this.fromLocation} → ${this.toLocation}`;
    return routeMultipliers[route] || 1.0;
  }

  /**
   * Get best travel times
   * @returns {Array} Sorted array of best times
   */
  getBestTimes() {
    return [...this.peakHoursData]
      .sort((a, b) => a.avgPrice - b.avgPrice)
      .slice(0, 3);
  }

  /**
   * Update context data
   * @param {Object} newContext - New context data
   */
  updateContext(newContext) {
    this.contextData = { ...this.contextData, ...newContext };
    this.updateContextDisplay();
  }

  /**
   * Update context display
   */
  updateContextDisplay() {
    const weatherData = Utils.DOM.get("weather-data");
    const trafficData = Utils.DOM.get("traffic-data");
    const demandData = Utils.DOM.get("demand-data");

    if (weatherData) weatherData.textContent = this.contextData.weather;
    if (trafficData) trafficData.textContent = this.contextData.traffic;
    if (demandData) demandData.textContent = this.contextData.demand;
  }

  /**
   * Get current service data
   * @returns {Object} Current service information
   */
  getCurrentService() {
    return this.services.find((s) => s.id === this.selectedService);
  }

  /**
   * Export tracking data
   * @returns {Object} Exported data
   */
  exportData() {
    return {
      currentFares: this.currentFares,
      priceHistory: this.priceHistory,
      alerts: this.alerts,
      recommendations: this.recommendations,
      insights: this.insights,
      settings: {
        alertPrice: this.alertPrice,
        selectedService: this.selectedService,
        fromLocation: this.fromLocation,
        toLocation: this.toLocation,
      },
    };
  }
}

// Initialize global fare tracker
window.fareTracker = new FareTracker();

Utils.Logger.info("Fare tracker module loaded");
