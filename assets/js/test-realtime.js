// Initialize Supabase client
const supabaseUrl = "https://bcemiehsozdgzspvwkjk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZW1pZWhzb3pkZ3pzcHZ3a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjI1ODYsImV4cCI6MjA2NTI5ODU4Nn0.E6LTwwRwpQbeL37U2uXJ7ZxnQiaAe2FZwFLKhkBjUl8";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Test real-time updates
const testRealTimeUpdates = async () => {
  console.log("Testing real-time updates...");

  try {
    // Subscribe to fare updates
    const fareSubscription = supabaseClient
      .channel("test-fare-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fare_updates",
        },
        (payload) => {
          console.log("Fare Update:", payload);
        }
      )
      .subscribe();

    // Subscribe to ride tracking
    const rideSubscription = supabaseClient
      .channel("test-ride-tracking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_tracking",
        },
        (payload) => {
          console.log("Ride Update:", payload);
        }
      )
      .subscribe();

    // Test fare update
    const testFareUpdate = async () => {
      const { data, error } = await supabaseClient.from("fare_updates").insert({
        service: "uber",
        price: 29.99,
        change_percentage: 1.5,
      });

      if (error) {
        console.error("Error inserting fare update:", error);
      } else {
        console.log("Test fare update inserted:", data);
      }
    };

    // Test ride tracking update
    const testRideUpdate = async () => {
      const { data, error } = await supabaseClient
        .from("ride_tracking")
        .insert({
          service: "uber",
          status: "active",
          location: { lat: 40.7128, lng: -74.006 },
          eta: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        });

      if (error) {
        console.error("Error inserting ride update:", error);
      } else {
        console.log("Test ride update inserted:", data);
      }
    };

    // Run tests after a short delay
    setTimeout(() => {
      console.log("Running test updates...");
      testFareUpdate();
      testRideUpdate();
    }, 2000);
  } catch (error) {
    console.error("Error in testRealTimeUpdates:", error);
  }
};

// Run the test when the page loads
document.addEventListener("DOMContentLoaded", () => {
  testRealTimeUpdates();
});
