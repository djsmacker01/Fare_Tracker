// Initialize Supabase client
const supabase = window.supabaseClient;

// DOM elements
const predictionsContainer = document.getElementById("predictions-container");
const insightsContainer = document.getElementById("insights-container");

// Subscribe to real-time updates
function subscribeToPredictions() {
  const predictionsChannel = supabase
    .channel("price_predictions")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "price_predictions",
      },
      (payload) => {
        displayPrediction(payload.new);
      }
    )
    .subscribe();

  const insightsChannel = supabase
    .channel("insights")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "insights",
      },
      (payload) => {
        displayInsight(payload.new);
      }
    )
    .subscribe();
}

// Display a single prediction
function displayPrediction(prediction) {
  const predictionElement = document.createElement("div");
  predictionElement.className = "prediction-card";

  const trendIcon = prediction.trend === "rising" ? "📈" : "📉";
  const confidenceColor =
    prediction.confidence > 70
      ? "high-confidence"
      : prediction.confidence > 40
      ? "medium-confidence"
      : "low-confidence";

  predictionElement.innerHTML = `
    <div class="prediction-header">
      <h3>${prediction.service.toUpperCase()}</h3>
      <span class="trend">${trendIcon}</span>
    </div>
    <div class="prediction-details">
      <p>Current: $${prediction.current_price.toFixed(2)}</p>
      <p>Predicted: $${prediction.predicted_price.toFixed(2)}</p>
      <p class="confidence ${confidenceColor}">
        Confidence: ${prediction.confidence}%
      </p>
    </div>
    <div class="prediction-time">
      ${new Date(prediction.created_at).toLocaleTimeString()}
    </div>
  `;

  predictionsContainer.insertBefore(
    predictionElement,
    predictionsContainer.firstChild
  );
}

// Display a single insight
function displayInsight(insight) {
  const insightElement = document.createElement("div");
  insightElement.className = `insight-card priority-${insight.priority}`;

  insightElement.innerHTML = `
    <div class="insight-header">
      <h3>${insight.type.replace("_", " ").toUpperCase()}</h3>
      <span class="priority">${insight.priority}</span>
    </div>
    <p class="insight-message">${insight.message}</p>
    <div class="insight-time">
      ${new Date(insight.created_at).toLocaleTimeString()}
    </div>
  `;

  insightsContainer.insertBefore(insightElement, insightsContainer.firstChild);
}

// Load initial data
async function loadInitialData() {
  // Load recent predictions
  const { data: predictions, error: predictionsError } = await supabase
    .from("price_predictions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (predictionsError) {
    console.error("Error loading predictions:", predictionsError);
    return;
  }

  predictions.forEach(displayPrediction);

  // Load recent insights
  const { data: insights, error: insightsError } = await supabase
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (insightsError) {
    console.error("Error loading insights:", insightsError);
    return;
  }

  insights.forEach(displayInsight);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadInitialData();
  subscribeToPredictions();
});
