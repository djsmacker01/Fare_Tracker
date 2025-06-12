// Initialize Supabase client
const supabaseUrl = "https://bcemiehsozdgzspvwkjk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZW1pZWhzb3pkZ3pzcHZ3a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjI1ODYsImV4cCI6MjA2NTI5ODU4Nn0.E6LTwwRwpQbeL37U2uXJ7ZxnQiaAe2FZwFLKhkBjUl8";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Real-time tracking setup
const setupRealTimeTracking = async () => {
  // Subscribe to real-time updates for ride tracking
  const rideTrackingSubscription = supabase
    .channel("ride-tracking")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ride_tracking",
      },
      (payload) => {
        handleRideUpdate(payload);
      }
    )
    .subscribe();

  // Subscribe to real-time updates for fare changes
  const fareUpdatesSubscription = supabase
    .channel("fare-updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "fare_updates",
      },
      (payload) => {
        handleFareUpdate(payload);
      }
    )
    .subscribe();
};

// Handle ride tracking updates
const handleRideUpdate = (payload) => {
  const { new: newData, old: oldData, eventType } = payload;

  switch (eventType) {
    case "INSERT": {
      // New ride started
      updateRideStatus(newData);
      break;
    }
    case "UPDATE": {
      // Ride status or location updated
      updateRideStatus(newData);
      break;
    }
    case "DELETE": {
      // Ride completed or cancelled
      handleRideCompletion(oldData);
      break;
    }
  }
};

// Handle fare updates
const handleFareUpdate = (payload) => {
  const { new: newData } = payload;
  updateFareDisplay(newData);
};

// Update the UI with new ride status
const updateRideStatus = (rideData) => {
  const { service, status, location, eta } = rideData;

  // Update the fare card for the specific service
  const fareCard = document.querySelector(`[data-service="${service}"]`);
  if (fareCard) {
    const statusElement = fareCard.querySelector(".ai-prediction");
    if (statusElement) {
      statusElement.textContent = `Status: ${status} | ETA: ${eta}`;
    }
  }
};

// Update fare display with new prices
const updateFareDisplay = (fareData) => {
  const { service, price, change_percentage } = fareData;

  const fareCard = document.querySelector(`[data-service="${service}"]`);
  if (fareCard) {
    const priceElement = fareCard.querySelector(".fare-price");
    const changeElement = fareCard.querySelector(".price-change");

    if (priceElement) {
      priceElement.textContent = `£${price.toFixed(2)}`;
    }

    if (changeElement) {
      const changeText = changeElement.querySelector(".change-text");
      const changeIcon = changeElement.querySelector(".change-icon");

      if (changeText) {
        changeText.textContent = `${
          change_percentage > 0 ? "+" : ""
        }${change_percentage.toFixed(1)}%`;
      }

      if (changeIcon) {
        changeIcon.textContent = change_percentage > 0 ? "📈" : "📉";
      }
    }
  }
};

// Initialize real-time tracking when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setupRealTimeTracking();
});
