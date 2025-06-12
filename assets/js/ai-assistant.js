

"use strict";

/**
 * AI Assistant Class
 * Manages the conversational AI interface and provides intelligent responses
 */
class AIAssistant {
  constructor() {
    // Chat state
    this.messages = [];
    this.isTyping = false;
    this.currentContext = null;

    // Response templates and patterns
    this.responsePatterns = this.initializeResponsePatterns();
    this.contextualResponses = this.initializeContextualResponses();

    // DOM elements
    this.chatContainer = null;
    this.chatMessages = null;
    this.chatInput = null;
    this.chatForm = null;
    this.suggestionButtons = null;

    // Initialize the assistant
    this.init();
  }

  /**
   * Initialize the AI Assistant
   */
  init() {
    try {
      this.setupDOMReferences();
      this.setupEventListeners();
      this.addWelcomeMessage();
      this.setupAccessibility();
    } catch (error) {
      console.error("Error initializing AI Assistant:", error);
    }
  }

  /**
   * Setup DOM element references
   */
  setupDOMReferences() {
    this.chatContainer = document.querySelector(".ai-chat-container");
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input");
    this.chatForm = document.getElementById("chat-form");
    this.suggestionButtons = document.querySelectorAll(".suggestion-btn");
  }

  /**
   * Setup event listeners for the chat interface
   */
  setupEventListeners() {
    // Chat form submission
    if (this.chatForm) {
      this.chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserMessage();
      });
    }

    // Chat input events
    if (this.chatInput) {
      this.chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleUserMessage();
        }
      });

      this.chatInput.addEventListener("input", () => {
        this.handleInputChange();
      });
    }

    // Suggestion buttons
    this.suggestionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const suggestion = button.dataset.suggestion;
        if (suggestion) {
          this.handleSuggestionClick(suggestion);
        }
      });
    });
  }

  /**
   * Setup accessibility features for the chat
   */
  setupAccessibility() {
    // Set up ARIA labels and roles
    if (this.chatMessages) {
      this.chatMessages.setAttribute("role", "log");
      this.chatMessages.setAttribute("aria-live", "polite");
      this.chatMessages.setAttribute("aria-label", "Chat conversation");
    }

    if (this.chatInput) {
      this.chatInput.setAttribute(
        "aria-label",
        "Type your message to AI assistant"
      );
    }
  }

  /**
   * Add welcome message when chat initializes
   */
  addWelcomeMessage() {
    const welcomeMessage =
      "Hi! I'm your AI transportation assistant. I can help you optimize your rides, predict prices, and find the best travel times. What would you like to know?";
    this.addMessage(welcomeMessage, "ai");
  }

  /**
   * Handle user message submission
   */
  handleUserMessage() {
    const message = this.chatInput.value.trim();

    if (!message) {
      this.focusInput();
      return;
    }

    // Add user message
    this.addMessage(message, "user");

    // Clear input
    this.chatInput.value = "";

    // Show typing indicator
    this.showTypingIndicator();

    // Generate AI response
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1000 + Math.random() * 1500); // Simulate thinking time
  }

  /**
   * Handle suggestion button clicks
   * @param {string} suggestion - Suggestion text
   */
  handleSuggestionClick(suggestion) {
    this.chatInput.value = suggestion;
    this.chatInput.focus();
  }

  /**
   * Handle input change events
   */
  handleInputChange() {
    // Could add features like typing indicators for other users
    // or real-time suggestions here
  }

  /**
   * Add message to chat
   * @param {string} message - Message text
   * @param {string} type - Message type ('user', 'ai', 'system')
   */
  addMessage(message, type = "ai") {
    try {
      const messageId = Utils.generateId("msg");
      const timestamp = new Date().toLocaleTimeString();

      const messageObj = {
        id: messageId,
        text: message,
        type: type,
        timestamp: timestamp,
        time: new Date(),
      };

      this.messages.push(messageObj);

      // Update UI
      this.renderMessage(messageObj);
      this.scrollToBottom();

      // Update context
      this.updateContext(messageObj);
    } catch (error) {
      console.error("Error adding message:", error);
    }
  }

  /**
   * Render a single message in the chat
   * @param {Object} messageObj - Message object
   */
  renderMessage(messageObj) {
    if (!this.chatMessages) return;

    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${messageObj.type}`;
    messageElement.id = messageObj.id;

    const bubbleElement = document.createElement("div");
    bubbleElement.className = `message-bubble ${messageObj.type}`;

    const textElement = document.createElement("div");
    textElement.className = "message-text";
    textElement.textContent = messageObj.text;

    const timeElement = document.createElement("div");
    timeElement.className = "message-time";
    timeElement.textContent = messageObj.timestamp;

    bubbleElement.appendChild(textElement);
    bubbleElement.appendChild(timeElement);
    messageElement.appendChild(bubbleElement);

    // Add accessibility attributes
    messageElement.setAttribute("role", "log");
    messageElement.setAttribute(
      "aria-label",
      `${messageObj.type === "user" ? "You" : "AI Assistant"} said: ${
        messageObj.text
      } at ${messageObj.timestamp}`
    );

    this.chatMessages.appendChild(messageElement);
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    if (this.isTyping) return;

    this.isTyping = true;

    const typingElement = document.createElement("div");
    typingElement.className = "chat-message ai typing-indicator";
    typingElement.id = "typing-indicator";

    const bubbleElement = document.createElement("div");
    bubbleElement.className = "message-bubble ai";

    const dotsElement = document.createElement("div");
    dotsElement.className = "typing-dots";
    dotsElement.innerHTML = "<span></span><span></span><span></span>";
    dotsElement.setAttribute("aria-label", "AI is typing");

    bubbleElement.appendChild(dotsElement);
    typingElement.appendChild(bubbleElement);

    if (this.chatMessages) {
      this.chatMessages.appendChild(typingElement);
      this.scrollToBottom();
    }
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    this.isTyping = false;

    const typingElement = document.getElementById("typing-indicator");
    if (typingElement) {
      typingElement.remove();
    }
  }

  /**
   * Generate AI response based on user input
   * @param {string} userMessage - User's message
   */
  generateAIResponse(userMessage) {
    try {
      this.hideTypingIndicator();

      const response = this.processUserMessage(userMessage.toLowerCase());
      this.addMessage(response, "ai");
    } catch (error) {
      console.error("Error generating AI response:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "I'm sorry, I encountered an error. Please try again.",
        "ai"
      );
    }
  }

  /**
   * Process user message and generate appropriate response
   * @param {string} message - User message (lowercase)
   * @returns {string} AI response
   */
  processUserMessage(message) {
    // Check for specific patterns and keywords
    for (const pattern of this.responsePatterns) {
      if (pattern.keywords.some((keyword) => message.includes(keyword))) {
        return this.selectResponse(pattern.responses);
      }
    }

    // Check for contextual responses
    if (this.currentContext) {
      const contextResponse = this.getContextualResponse(message);
      if (contextResponse) {
        return contextResponse;
      }
    }

    // Fallback responses
    return this.selectResponse([
      "I understand you're asking about transportation. Could you be more specific about what you'd like to know?",
      "That's an interesting question! I can help with pricing, timing, routes, and optimization. What would you like to explore?",
      "I'm here to help with your transportation needs. Feel free to ask about fare comparisons, best travel times, or route suggestions.",
      "Let me think about that... Is there a specific aspect of transportation you'd like me to focus on?",
    ]);
  }

  /**
   * Get contextual response based on current conversation context
   * @param {string} message - User message
   * @returns {string|null} Contextual response or null
   */
  getContextualResponse(message) {
    if (!this.currentContext) return null;

    const contextResponses = this.contextualResponses[this.currentContext];
    if (!contextResponses) return null;

    // Look for relevant contextual keywords
    for (const response of contextResponses) {
      if (response.keywords.some((keyword) => message.includes(keyword))) {
        return this.selectResponse(response.responses);
      }
    }

    return null;
  }

  /**
   * Select a random response from an array
   * @param {string[]} responses - Array of possible responses
   * @returns {string} Selected response
   */
  selectResponse(responses) {
    if (!Array.isArray(responses) || responses.length === 0) {
      return "I'm not sure how to respond to that. Could you try rephrasing your question?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Update conversation context based on message
   * @param {Object} messageObj - Message object
   */
  updateContext(messageObj) {
    if (messageObj.type !== "user") return;

    const message = messageObj.text.toLowerCase();

    // Determine context based on keywords
    if (
      message.includes("price") ||
      message.includes("cost") ||
      message.includes("fare")
    ) {
      this.currentContext = "pricing";
    } else if (
      message.includes("time") ||
      message.includes("when") ||
      message.includes("schedule")
    ) {
      this.currentContext = "timing";
    } else if (
      message.includes("route") ||
      message.includes("direction") ||
      message.includes("way")
    ) {
      this.currentContext = "routing";
    } else if (
      message.includes("save") ||
      message.includes("budget") ||
      message.includes("cheap")
    ) {
      this.currentContext = "savings";
    } else if (
      message.includes("weather") ||
      message.includes("rain") ||
      message.includes("snow")
    ) {
      this.currentContext = "weather";
    } else {
      this.currentContext = "general";
    }
  }

  /**
   * Initialize response patterns
   * @returns {Array} Array of response patterns
   */
  initializeResponsePatterns() {
    return [
      {
        keywords: ["hello", "hi", "hey", "start", "begin"],
        responses: [
          "Hello! I'm here to help you optimize your transportation. What would you like to know about fares, timing, or routes?",
          "Hi there! I can help you save money and time on your rides. Ask me about current prices, best travel times, or route suggestions.",
          "Hey! Ready to make your transportation smarter? I can provide fare comparisons, timing advice, and cost-saving tips.",
        ],
      },
      {
        keywords: ["price", "cost", "fare", "expensive", "cheap"],
        responses: [
          "Based on current patterns and contextual data, I predict prices will drop 15% in the next hour due to decreasing demand after rush hour.",
          "Current prices are 20% below average right now. Uber is $28.50, Bolt is $26.80, and Taxi is $32.00 for your route.",
          "I'm seeing some price volatility. Bolt appears to be your best value right now, but prices could change in the next 20 minutes.",
          "Prices typically drop after 9 PM on weekdays. Would you like me to set up an alert for when fares reach your target price?",
        ],
      },
      {
        keywords: ["time", "when", "best time", "optimal", "schedule"],
        responses: [
          "The best travel times today are 10 AM (lowest prices), 2 PM (moderate prices, low demand), and after 8 PM (evening rates).",
          "Based on your route, I recommend leaving in 15 minutes to avoid the next surge period. Prices typically increase 40% between 5-7 PM.",
          "Historical data shows the cheapest times for your route are 6 AM, 10 AM, and 2 PM. Would you like me to analyze a specific time?",
          "Right now isn't the optimal time due to high demand. Wait 25 minutes for potential 18% savings, or book now to guarantee current rates.",
        ],
      },
      {
        keywords: ["weather", "rain", "snow", "storm"],
        responses: [
          "Rain is expected at 3 PM, which typically increases demand by 40%. I recommend booking before 2:30 PM to avoid surge pricing.",
          "Weather conditions definitely affect pricing. Clear weather like today usually means stable fares, but that can change quickly.",
          "I'm monitoring weather patterns. Storm systems typically increase ride demand by 30-50%, so planning ahead is wise.",
          "Bad weather is one of the biggest factors in surge pricing. I can set up weather-based alerts to help you plan better.",
        ],
      },
      {
        keywords: ["save", "budget", "money", "cheaper", "discount"],
        responses: [
          "I've analyzed your travel patterns. You could save $340/month by shifting 3 regular trips to off-peak hours.",
          "Here are three ways to save: 1) Travel during off-peak hours, 2) Compare all services before booking, 3) Use my price alerts.",
          "Budget tip: Setting alerts $3-5 below current prices often triggers within 30 minutes during non-peak hours.",
          "You're on track to spend $280 this month on rideshares. I can optimize 4 upcoming trips to keep you under your $250 budget.",
        ],
      },
      {
        keywords: ["route", "direction", "way", "path", "alternative"],
        responses: [
          "I found a better route: Take subway to Central Station, then Uber from there. This saves $12 and only adds 6 minutes.",
          "Your current route is optimal for time, but there's a multi-modal option that could save 35% if you're flexible with timing.",
          "Alternative route analysis shows 3 options: fastest ($31, 22 min), cheapest ($12, 31 min), or balanced ($18, 26 min).",
          "Traffic patterns suggest the highway route will be 15% faster right now, but surface streets might be cheaper.",
        ],
      },
      {
        keywords: ["book", "ride", "order", "get", "call"],
        responses: [
          "Perfect timing! Current prices are 20% below average. Shall I help you compare the best options before you book?",
          "Before you book, let me check... Bolt is currently 15% cheaper than Uber with the same estimated arrival time.",
          "Good choice! This is actually an optimal booking window. Prices are likely to increase in the next 30 minutes.",
          "I recommend booking with Bolt right now - it's $4.20 cheaper than alternatives and has 95% reliability for your route.",
        ],
      },
      {
        keywords: ["help", "how", "what", "explain"],
        responses: [
          "I can help with several things: price predictions, optimal timing, route suggestions, budget tracking, and setting up smart alerts.",
          "Think of me as your transportation advisor. I analyze patterns, predict prices, and help you make informed decisions about when and how to travel.",
          "I monitor real-time data from multiple sources to give you personalized recommendations. What specific aspect interests you?",
          "My specialties include: fare comparison across services, timing optimization, weather impact analysis, and budget management.",
        ],
      },
      {
        keywords: ["alert", "notify", "notification", "reminder"],
        responses: [
          "I can set up intelligent alerts based on price thresholds, time windows, weather conditions, or demand patterns. What works best for you?",
          "Smart alerts are one of my best features! I'll notify you about price drops, optimal booking windows, and surge warnings.",
          "Alert options include: price targets, time-based notifications, weather-triggered warnings, and budget threshold alerts.",
          "Would you like a simple price alert, or should I set up a smart alert that considers multiple factors like weather and demand?",
        ],
      },
      {
        keywords: ["uber", "lyft", "bolt", "taxi"],
        responses: [
          "I track all major services. Right now: Uber $28.50, Bolt $26.80, Taxi $32.00. Bolt offers the best value for your route.",
          "Each service has different strengths. Uber has the most availability, Bolt often has competitive pricing, and taxis are regulated and reliable.",
          "Service comparison: Uber leads in coverage, Bolt excels in pricing, traditional taxis offer consistent rates. Your best choice depends on priorities.",
          "I'm seeing dynamic pricing across all platforms. Let me analyze which service gives you the best combination of price and reliability.",
        ],
      },
      {
        keywords: ["thank", "thanks", "appreciate"],
        responses: [
          "You're welcome! I'm here whenever you need transportation advice. Feel free to ask about anything else.",
          "Happy to help! Remember, I'm constantly learning your patterns to provide better recommendations over time.",
          "My pleasure! Don't forget to enable notifications so I can alert you about great deals even when you're not here.",
          "Glad I could assist! Is there anything else about your transportation planning I can help with?",
        ],
      },
    ];
  }

  /**
   * Initialize contextual responses
   * @returns {Object} Object with contextual response patterns
   */
  initializeContextualResponses() {
    return {
      pricing: [
        {
          keywords: ["why", "reason", "because"],
          responses: [
            "Prices fluctuate based on demand, driver availability, weather, events, and traffic conditions. I analyze all these factors in real-time.",
            "Several factors affect pricing: time of day, weather conditions, local events, driver supply, and historical demand patterns.",
            "The pricing algorithm considers surge demand, driver availability, traffic conditions, and even weather forecasts.",
          ],
        },
        {
          keywords: ["predict", "forecast", "future"],
          responses: [
            "Based on historical patterns, prices should decrease 15% in the next hour as rush hour traffic subsides.",
            "My prediction model suggests stable pricing for the next 2 hours, with a potential 8% increase around dinner time.",
            "Forecasting shows a 70% chance of price reduction in 20 minutes when the current demand spike ends.",
          ],
        },
      ],
      timing: [
        {
          keywords: ["rush hour", "peak", "busy"],
          responses: [
            "Rush hour pricing is typically 40-60% higher. The peak periods are 7-9 AM and 5-7 PM on weekdays.",
            "Peak demand periods see the highest prices. I recommend traveling before 7 AM or after 9 AM for morning trips.",
            "Busy times mean higher prices and longer wait times. Off-peak travel can save you 30-50% on average.",
          ],
        },
        {
          keywords: ["weekend", "saturday", "sunday"],
          responses: [
            "Weekend patterns differ from weekdays. Friday and Saturday nights see surge pricing, but weekend days are often cheaper.",
            "Weekend pricing is more event-driven. Concert venues, sports events, and nightlife areas see the biggest surges.",
            "Saturday mornings and Sunday afternoons typically offer the best weekend rates.",
          ],
        },
      ],
      routing: [
        {
          keywords: ["faster", "quicker", "speed"],
          responses: [
            "The fastest route isn't always the cheapest. I can show you time vs. cost trade-offs for your specific trip.",
            "Speed priority would suggest the highway route, but it costs 20% more due to distance. Surface streets balance time and cost.",
            "For fastest travel, I recommend the direct route via Main Street, estimated 18 minutes for $31.",
          ],
        },
        {
          keywords: ["avoid", "traffic", "construction"],
          responses: [
            "I'm tracking current traffic conditions. The downtown route has a 15-minute delay due to construction on 5th Street.",
            "Traffic avoidance route would add 8 minutes but save $6. It goes via the riverside path instead of downtown.",
            "Construction on your usual route is causing 20-minute delays. I recommend the alternative route via Oak Street.",
          ],
        },
      ],
      savings: [
        {
          keywords: ["how much", "amount", "dollars"],
          responses: [
            "Based on your travel patterns, you could save approximately $85/month by optimizing just your regular commute times.",
            "Monthly savings potential: $340 if you shift to off-peak hours, $150 with better service selection, $95 with route optimization.",
            "Your current spending is $280/month. With smart timing, you could reduce this to $195-220/month.",
          ],
        },
        {
          keywords: ["tips", "advice", "suggestions"],
          responses: [
            "Top savings tips: 1) Travel off-peak when possible, 2) Set price alerts, 3) Compare all services, 4) Consider multi-modal trips.",
            "Budget-friendly strategies: book during low-demand periods, use price alerts, split longer trips, and consider public transit combinations.",
            "Smart saving approach: I'll learn your patterns and automatically suggest the most cost-effective options for each trip.",
          ],
        },
      ],
      weather: [
        {
          keywords: ["impact", "affect", "change"],
          responses: [
            "Weather significantly impacts pricing. Rain increases demand by 30-40%, snow by 50-70%, and storms can double prices.",
            "Bad weather affects both demand and driver supply. Fewer drivers work during storms, while passenger demand increases.",
            "Weather impact varies by severity. Light rain might add 15% to fares, while heavy storms can cause 2-3x surge pricing.",
          ],
        },
      ],
    };
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  /**
   * Focus chat input
   */
  focusInput() {
    if (this.chatInput) {
      this.chatInput.focus();
    }
  }

  /**
   * Clear chat history
   */
  clearChat() {
    this.messages = [];
    if (this.chatMessages) {
      this.chatMessages.innerHTML = "";
    }
    this.addWelcomeMessage();
  }

  /**
   * Get chat history
   * @returns {Array} Array of messages
   */
  getChatHistory() {
    return [...this.messages];
  }

  /**
   * Export chat history as text
   * @returns {string} Chat history as formatted text
   */
  exportChatHistory() {
    const chatText = this.messages
      .map((msg) => {
        const sender = msg.type === "user" ? "You" : "AI Assistant";
        return `[${msg.timestamp}] ${sender}: ${msg.text}`;
      })
      .join("\n");

    return `Fare Tracker Chat History\nExported: ${new Date().toLocaleString()}\n\n${chatText}`;
  }

  /**
   * Set typing status (for external use)
   * @param {boolean} typing - Whether AI is typing
   */
  setTyping(typing) {
    if (typing && !this.isTyping) {
      this.showTypingIndicator();
    } else if (!typing && this.isTyping) {
      this.hideTypingIndicator();
    }
  }

  /**
   * Add system message
   * @param {string} message - System message
   */
  addSystemMessage(message) {
    this.addMessage(message, "system");
  }

  /**
   * Handle external message (from other parts of the app)
   * @param {string} message - Message to add
   * @param {string} type - Message type
   */
  handleExternalMessage(message, type = "ai") {
    this.addMessage(message, type);
  }

  /**
   * Get current context
   * @returns {string} Current conversation context
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * Set conversation context
   * @param {string} context - Context to set
   */
  setContext(context) {
    this.currentContext = context;
  }

  /**
   * Get message statistics
   * @returns {Object} Message statistics
   */
  getMessageStats() {
    const userMessages = this.messages.filter(
      (msg) => msg.type === "user"
    ).length;
    const aiMessages = this.messages.filter((msg) => msg.type === "ai").length;
    const totalMessages = this.messages.length;

    return {
      total: totalMessages,
      user: userMessages,
      ai: aiMessages,
      averageResponseTime: this.calculateAverageResponseTime(),
    };
  }

  /**
   * Calculate average response time
   * @returns {number} Average response time in seconds
   */
  calculateAverageResponseTime() {
    const responseTimes = [];

    for (let i = 1; i < this.messages.length; i++) {
      const current = this.messages[i];
      const previous = this.messages[i - 1];

      if (current.type === "ai" && previous.type === "user") {
        const timeDiff = (current.time - previous.time) / 1000;
        responseTimes.push(timeDiff);
      }
    }

    if (responseTimes.length === 0) return 0;

    const sum = responseTimes.reduce((a, b) => a + b, 0);
    return sum / responseTimes.length;
  }

  /**
   * Destroy the AI Assistant instance
   */
  destroy() {
    // Remove event listeners
    if (this.chatForm) {
      this.chatForm.removeEventListener("submit", this.handleUserMessage);
    }

    if (this.chatInput) {
      this.chatInput.removeEventListener("keydown", this.handleUserMessage);
      this.chatInput.removeEventListener("input", this.handleInputChange);
    }

    this.suggestionButtons.forEach((button) => {
      button.removeEventListener("click", this.handleSuggestionClick);
    });

    // Clear references
    this.messages = [];
    this.chatContainer = null;
    this.chatMessages = null;
    this.chatInput = null;
    this.chatForm = null;
    this.suggestionButtons = null;
  }
}

// Make AIAssistant globally available
window.AIAssistant = AIAssistant;
