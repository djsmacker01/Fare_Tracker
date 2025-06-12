/**
 * Fare Tracker - Chart Configuration Module
 * Description: Handles all data visualization using Chart.js
 * Author: Your Name
 * Created: 2024
 *
 * This module provides:
 * - Price history line charts
 * - Demand pattern bar charts
 * - Prediction visualizations
 * - Real-time chart updates
 * - Responsive chart configurations
 */

"use strict";

/**
 * Chart Configuration Class
 * Manages all charts and data visualizations in the application
 */
class ChartConfig {
  constructor() {
    // Chart instances
    this.charts = {
      priceChart: null,
      demandChart: null,
      predictionChart: null,
    };

    // Chart configurations
    this.defaultConfig = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false, // We'll use custom legends
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#3B82F6",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "#6B7280",
            font: {
              size: 12,
              family: "Inter, sans-serif",
            },
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "#6B7280",
            font: {
              size: 12,
              family: "Inter, sans-serif",
            },
            callback: function (value) {
              return `£${value.toFixed(0)}`;
            },
          },
        },
      },
      animation: {
        duration: 750,
        easing: "easeInOutQuart",
      },
    };

    // Color schemes
    this.colors = {
      uber: {
        primary: "#000000",
        light: "rgba(0, 0, 0, 0.1)",
        gradient: ["rgba(0, 0, 0, 0.8)", "rgba(0, 0, 0, 0.2)"],
      },
      bolt: {
        primary: "#34C759",
        light: "rgba(52, 199, 89, 0.1)",
        gradient: ["rgba(52, 199, 89, 0.8)", "rgba(52, 199, 89, 0.2)"],
      },
      taxi: {
        primary: "#FF9500",
        light: "rgba(255, 149, 0, 0.1)",
        gradient: ["rgba(255, 149, 0, 0.8)", "rgba(255, 149, 0, 0.2)"],
      },
      prediction: {
        primary: "#8B5CF6",
        light: "rgba(139, 92, 246, 0.1)",
        gradient: ["rgba(139, 92, 246, 0.8)", "rgba(139, 92, 246, 0.2)"],
      },
      demand: {
        primary: "#3B82F6",
        light: "rgba(59, 130, 246, 0.1)",
        gradient: ["rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.2)"],
      },
      efficiency: {
        primary: "#10B981",
        light: "rgba(16, 185, 129, 0.1)",
        gradient: ["rgba(16, 185, 129, 0.8)", "rgba(16, 185, 129, 0.2)"],
      },
    };

    this.init();
  }

  /**
   * Initialize chart configurations
   */
  init() {
    try {
      // Ensure Chart.js is loaded
      if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded");
        return;
      }

      // Configure Chart.js defaults
      this.configureChartDefaults();

      // Register custom plugins if needed
      this.registerCustomPlugins();

      console.log("ChartConfig initialized successfully");
    } catch (error) {
      console.error("Error initializing ChartConfig:", error);
    }
  }

  /**
   * Configure Chart.js default settings
   */
  configureChartDefaults() {
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#6B7280";
    Chart.defaults.borderColor = "rgba(0, 0, 0, 0.1)";
    Chart.defaults.backgroundColor = "rgba(59, 130, 246, 0.1)";
  }

  /**
   * Register custom Chart.js plugins
   */
  registerCustomPlugins() {
    // Custom plugin for enhanced tooltips
    Chart.register({
      id: "customTooltip",
      beforeTooltipDraw: (chart, args, options) => {
        // Custom tooltip enhancements can be added here
      },
    });
  }

  /**
   * Initialize all charts
   */
  initializeCharts() {
    try {
      this.initializePriceChart();
      this.initializeDemandChart();
      console.log("All charts initialized");
    } catch (error) {
      console.error("Error initializing charts:", error);
    }
  }

  /**
   * Initialize price history chart
   */
  initializePriceChart() {
    const canvas = document.getElementById("price-chart");
    if (!canvas) {
      console.warn("Price chart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Sample data - will be replaced with real data
    const sampleData = this.generateSamplePriceData();

    const config = {
      type: "line",
      data: {
        labels: sampleData.labels,
        datasets: [
          this.createLineDataset("Uber", sampleData.uber, this.colors.uber),
          this.createLineDataset("Bolt", sampleData.bolt, this.colors.bolt),
          this.createLineDataset("Taxi", sampleData.taxi, this.colors.taxi),
          this.createPredictionDataset(
            "AI Prediction",
            sampleData.prediction,
            this.colors.prediction
          ),
        ],
      },
      options: {
        ...this.defaultConfig,
        plugins: {
          ...this.defaultConfig.plugins,
          tooltip: {
            ...this.defaultConfig.plugins.tooltip,
            callbacks: {
              title: (context) => {
                return `Time: ${context[0].label}`;
              },
              label: (context) => {
                const value = this.formatPrice(context.parsed.y);
                return `${context.dataset.label}: ${value}`;
              },
              afterBody: (context) => {
                if (context[0].datasetIndex === 3) {
                  // Prediction dataset
                  return ["", "AI Confidence: 85%"];
                }
                return [];
              },
            },
          },
        },
        scales: {
          ...this.defaultConfig.scales,
          y: {
            ...this.defaultConfig.scales.y,
            beginAtZero: false,
            min:
              Math.min(
                ...sampleData.uber,
                ...sampleData.bolt,
                ...sampleData.taxi
              ) - 5,
            max:
              Math.max(
                ...sampleData.uber,
                ...sampleData.bolt,
                ...sampleData.taxi
              ) + 5,
          },
        },
      },
    };

    this.charts.priceChart = new Chart(ctx, config);
  }

  /**
   * Initialize demand pattern chart
   */
  initializeDemandChart() {
    const canvas = document.getElementById("demand-chart");
    if (!canvas) {
      console.warn("Demand chart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Sample demand data
    const sampleData = this.generateSampleDemandData();

    const config = {
      type: "bar",
      data: {
        labels: sampleData.labels,
        datasets: [
          {
            label: "Demand",
            data: sampleData.demand,
            backgroundColor: this.createGradient(
              ctx,
              this.colors.demand.gradient
            ),
            borderColor: this.colors.demand.primary,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: "Efficiency",
            data: sampleData.efficiency,
            backgroundColor: this.createGradient(
              ctx,
              this.colors.efficiency.gradient
            ),
            borderColor: this.colors.efficiency.primary,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...this.defaultConfig,
        plugins: {
          ...this.defaultConfig.plugins,
          tooltip: {
            ...this.defaultConfig.plugins.tooltip,
            callbacks: {
              title: (context) => {
                return `Hour: ${context[0].label}`;
              },
              label: (context) => {
                const suffix =
                  context.datasetIndex === 0 ? "% demand" : "% efficiency";
                return `${context.dataset.label}: ${context.parsed.y}${suffix}`;
              },
            },
          },
        },
        scales: {
          ...this.defaultConfig.scales,
          y: {
            ...this.defaultConfig.scales.y,
            beginAtZero: true,
            max: 100,
            ticks: {
              ...this.defaultConfig.scales.y.ticks,
              callback: function (value) {
                return `${value}%`;
              },
            },
          },
        },
      },
    };

    this.charts.demandChart = new Chart(ctx, config);
  }

  /**
   * Create line dataset configuration
   * @param {string} label - Dataset label
   * @param {number[]} data - Data points
   * @param {Object} colors - Color configuration
   * @returns {Object} Dataset configuration
   */
  createLineDataset(label, data, colors) {
    return {
      label: label,
      data: data,
      borderColor: colors.primary,
      backgroundColor: colors.light,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: colors.primary,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: colors.primary,
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    };
  }

  /**
   * Create prediction dataset with dashed line
   * @param {string} label - Dataset label
   * @param {number[]} data - Data points
   * @param {Object} colors - Color configuration
   * @returns {Object} Dataset configuration
   */
  createPredictionDataset(label, data, colors) {
    return {
      label: label,
      data: data,
      borderColor: colors.primary,
      backgroundColor: colors.light,
      borderWidth: 2,
      borderDash: [5, 5],
      fill: true,
      tension: 0.4,
      pointBackgroundColor: colors.primary,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: colors.primary,
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    };
  }

  /**
   * Create gradient for chart backgrounds
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string[]} colors - Gradient colors
   * @returns {CanvasGradient} Gradient object
   */
  createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  }

  /**
   * Generate sample price data
   * @returns {Object} Sample data object
   */
  generateSamplePriceData() {
    const labels = [];
    const uber = [];
    const bolt = [];
    const taxi = [];
    const prediction = [];

    // Generate 12 data points for the last 12 hours
    for (let i = 11; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);

      labels.push(
        time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );

      // Generate realistic price variations
      const baseHour = time.getHours();
      const timeMultiplier = this.getTimeMultiplier(baseHour);

      uber.push(
        parseFloat((22 * timeMultiplier + (Math.random() - 0.5) * 4).toFixed(2))
      );
      bolt.push(
        parseFloat(
          (20 * timeMultiplier + (Math.random() - 0.5) * 3.5).toFixed(2)
        )
      );
      taxi.push(
        parseFloat((26 * timeMultiplier + (Math.random() - 0.5) * 3).toFixed(2))
      );
    }

    // Add prediction points (3 future points)
    for (let i = 1; i <= 3; i++) {
      const time = new Date();
      time.setHours(time.getHours() + i);

      labels.push(
        time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );

      uber.push(null); // No historical data for future
      bolt.push(null);
      taxi.push(null);

      // Generate prediction
      const baseHour = time.getHours();
      const timeMultiplier = this.getTimeMultiplier(baseHour);
      prediction.push(
        parseFloat((24 * timeMultiplier + (Math.random() - 0.5) * 2).toFixed(2))
      );
    }

    // Fill prediction array with nulls for historical data
    while (prediction.length < labels.length) {
      prediction.unshift(null);
    }

    return { labels, uber, bolt, taxi, prediction };
  }

  /**
   * Generate sample demand data
   * @returns {Object} Sample demand data
   */
  generateSampleDemandData() {
    const labels = ["6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM"];
    const demand = [30, 85, 95, 70, 40, 45, 60, 55];
    const efficiency = [85, 45, 25, 60, 90, 85, 70, 75];

    return { labels, demand, efficiency };
  }

  /**
   * Get time-based multiplier for realistic pricing
   * @param {number} hour - Hour (0-23)
   * @returns {number} Multiplier value
   */
  getTimeMultiplier(hour) {
    const multipliers = {
      0: 0.8,
      1: 0.7,
      2: 0.7,
      3: 0.7,
      4: 0.8,
      5: 0.9,
      6: 1.1,
      7: 1.6,
      8: 1.8,
      9: 1.3,
      10: 1.0,
      11: 1.1,
      12: 1.2,
      13: 1.1,
      14: 1.0,
      15: 1.2,
      16: 1.4,
      17: 1.7,
      18: 1.8,
      19: 1.4,
      20: 1.2,
      21: 1.3,
      22: 1.4,
      23: 1.1,
    };

    return multipliers[hour] || 1.0;
  }

  /**
   * Update price chart with new data
   * @param {Object} newPrices - New price data
   */
  updatePriceChart(newPrices) {
    if (!this.charts.priceChart) {
      return;
    }

    try {
      const chart = this.charts.priceChart;
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Add new data point
      chart.data.labels.push(currentTime);

      // Update datasets
      chart.data.datasets[0].data.push(newPrices.uber);
      chart.data.datasets[1].data.push(newPrices.bolt);
      chart.data.datasets[2].data.push(newPrices.taxi);

      // Keep only last 12 data points for historical data
      if (chart.data.labels.length > 15) {
        // 12 historical + 3 prediction
        chart.data.labels.shift();
        chart.data.datasets.forEach((dataset) => {
          if (dataset.data[0] !== null) {
            dataset.data.shift();
          }
        });
      }

      // Update chart
      chart.update("none"); // Use 'none' for smooth real-time updates
    } catch (error) {
      console.error("Error updating price chart:", error);
    }
  }

  /**
   * Update demand chart with new data
   * @param {Array} demandData - New demand data
   */
  updateDemandChart(demandData = null) {
    if (!this.charts.demandChart) {
      return;
    }

    try {
      const chart = this.charts.demandChart;

      if (demandData) {
        chart.data.datasets[0].data = demandData.demand;
        chart.data.datasets[1].data = demandData.efficiency;
        chart.update();
      }
    } catch (error) {
      console.error("Error updating demand chart:", error);
    }
  }

  /**
   * Update chart colors based on theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  updateTheme(theme) {
    const textColor = theme === "dark" ? "#E5E7EB" : "#6B7280";
    const gridColor =
      theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.update();
      }
    });
  }

  /**
   * Resize all charts
   */
  handleResize() {
    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.resize();
      }
    });
  }

  /**
   * Export chart as image
   * @param {string} chartType - Type of chart to export
   * @returns {string} Base64 image data
   */
  exportChart(chartType) {
    const chart = this.charts[chartType];
    if (!chart) {
      console.warn(`Chart ${chartType} not found`);
      return null;
    }

    try {
      return chart.toBase64Image("image/png", 1.0);
    } catch (error) {
      console.error("Error exporting chart:", error);
      return null;
    }
  }

  /**
   * Get chart statistics
   * @returns {Object} Chart statistics
   */
  getChartStats() {
    const stats = {};

    Object.entries(this.charts).forEach(([name, chart]) => {
      if (chart) {
        stats[name] = {
          initialized: true,
          dataPoints: chart.data.labels.length,
          datasets: chart.data.datasets.length,
          lastUpdate: new Date().toISOString(),
        };
      } else {
        stats[name] = {
          initialized: false,
          dataPoints: 0,
          datasets: 0,
          lastUpdate: null,
        };
      }
    });

    return stats;
  }

  /**
   * Animate chart appearance
   * @param {string} chartType - Type of chart to animate
   */
  animateChart(chartType) {
    const chart = this.charts[chartType];
    if (!chart) {
      return;
    }

    chart.update("active");
  }

  /**
   * Reset chart zoom
   * @param {string} chartType - Type of chart to reset
   */
  resetZoom(chartType) {
    const chart = this.charts[chartType];
    if (chart?.resetZoom) {
      chart.resetZoom();
    }
  }

  /**
   * Toggle dataset visibility
   * @param {string} chartType - Type of chart
   * @param {number} datasetIndex - Index of dataset to toggle
   */
  toggleDataset(chartType, datasetIndex) {
    const chart = this.charts[chartType];
    if (!chart) {
      return;
    }

    const meta = chart.getDatasetMeta(datasetIndex);
    meta.hidden = !meta.hidden;
    chart.update();
  }

  /**
   * Get chart data for external use
   * @param {string} chartType - Type of chart
   * @returns {Object} Chart data
   */
  getChartData(chartType) {
    const chart = this.charts[chartType];
    if (!chart) {
      return null;
    }

    return {
      labels: [...chart.data.labels],
      datasets: chart.data.datasets.map((dataset) => ({
        label: dataset.label,
        data: [...dataset.data],
      })),
    };
  }

  /**
   * Update chart options
   * @param {string} chartType - Type of chart
   * @param {Object} options - New options
   */
  updateOptions(chartType, options) {
    const chart = this.charts[chartType];
    if (!chart) {
      return;
    }

    Object.assign(chart.options, options);
    chart.update();
  }

  /**
   * Destroy all charts
   */
  destroy() {
    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });

    this.charts = {
      priceChart: null,
      demandChart: null,
      predictionChart: null,
    };

    console.log("All charts destroyed");
  }

  /**
   * Create a new chart instance
   * @param {string} canvasId - Canvas element ID
   * @param {Object} config - Chart configuration
   * @returns {Chart} Chart instance
   */
  createChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return null;
    }

    const ctx = canvas.getContext("2d");
    return new Chart(ctx, config);
  }

  /**
   * Get available chart types
   * @returns {Array} Array of chart type names
   */
  getAvailableCharts() {
    return Object.keys(this.charts);
  }

  /**
   * Check if a chart is initialized
   * @param {string} chartType - Type of chart to check
   * @returns {boolean} True if chart is initialized
   */
  isChartInitialized(chartType) {
    return this.charts[chartType] !== null;
  }

  formatPrice(value) {
    return `£${value.toFixed(0)}`;
  }

  formatTooltip(context) {
    if (context[0].dataset.label === "Price") {
      return `£${context.parsed.y.toFixed(2)}`;
    }
    return `${context.dataset.label}: ${this.formatPrice(context.parsed.y)}`;
  }
}

// Create global instance
const ChartConfig = new (class {
  constructor() {
    this.instance = null;
  }

  init() {
    if (!this.instance) {
      this.instance = new ChartConfig();
    }
    return this.instance;
  }

  // Proxy methods to the instance
  initializeCharts() {
    return this.instance?.initializeCharts();
  }

  updatePriceChart(data) {
    return this.instance?.updatePriceChart(data);
  }

  updateDemandChart(data) {
    return this.instance?.updateDemandChart(data);
  }

  handleResize() {
    return this.instance?.handleResize();
  }

  destroy() {
    return this.instance?.destroy();
  }
})();

// Make ChartConfig globally available
window.ChartConfig = ChartConfig;
