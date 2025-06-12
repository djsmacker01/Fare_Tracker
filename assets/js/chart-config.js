// Chart.js Configuration and Utility Functions

// Global chart defaults
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = "rgba(0, 0, 0, 0.8)";
Chart.defaults.plugins.legend.position = "bottom";

// Price History Chart Configuration
const priceHistoryConfig = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Price History",
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Real-time Price History",
      },
    },
  },
};

// Demand Analysis Chart Configuration
const demandAnalysisConfig = {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Hourly Demand",
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Demand Level",
        },
      },
      x: {
        title: {
          display: true,
          text: "Hour of Day",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Hourly Demand Patterns",
      },
    },
  },
};

// Trend Visualization Chart Configuration
const trendVisualizationConfig = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Historical Data",
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Prediction",
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Historical Data with Predictions",
      },
    },
  },
};

// Performance Metrics Chart Configuration
const performanceMetricsConfig = {
  type: "radar",
  data: {
    labels: [
      "CPU Usage",
      "Memory",
      "Response Time",
      "Error Rate",
      "Throughput",
    ],
    datasets: [
      {
        label: "System Health",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(255, 99, 132, 1)",
        data: [],
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "System Performance Metrics",
      },
    },
  },
};

// Utility Functions
const updateChartData = (chart, newData, labels) => {
  chart.data.labels = labels;
  chart.data.datasets[0].data = newData;
  chart.update();
};

const addPredictionData = (chart, predictionData) => {
  if (chart.data.datasets.length < 2) {
    chart.data.datasets.push({
      label: "Prediction",
      borderColor: "#FF9800",
      backgroundColor: "rgba(255, 152, 0, 0.1)",
      borderWidth: 2,
      borderDash: [5, 5],
      fill: true,
      data: predictionData,
    });
  } else {
    chart.data.datasets[1].data = predictionData;
  }
  chart.update();
};

// Export configurations and utility functions
export {
  priceHistoryConfig,
  demandAnalysisConfig,
  trendVisualizationConfig,
  performanceMetricsConfig,
  updateChartData,
  addPredictionData,
};
