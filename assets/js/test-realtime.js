// Initialize Supabase client
const supabaseUrl = "https://bcemiehsozdgzspvwkjk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZW1pZWhzb3pkZ3pzcHZ3a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjI1ODYsImV4cCI6MjA2NTI5ODU4Nn0.E6LTwwRwpQbeL37U2uXJ7ZxnQiaAe2FZwFLKhkBjUl8";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Test real-time updates
const testRealTimeUpdates = async () => {
  console.log("Testing real-time updates...");

  try {
    // Wait for Supabase client to be initialized
    while (!window.supabaseClient) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Subscribe to fare updates
    const fareSubscription = window.supabaseClient
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
    const rideSubscription = window.supabaseClient
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
      // Insert new fare update
      const { error: insertError } = await window.supabaseClient
        .from("fare_updates")
        .insert({
          service: "uber",
          price: 29.99,
          change_percentage: 1.5,
        });

      if (insertError) {
        console.error("Error inserting fare update:", insertError);
        return;
      }

      // Fetch the latest fare update to verify
      const { data: fareData, error: fetchError } = await window.supabaseClient
        .from("fare_updates")
        .select("*")
        .eq("service", "uber")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error("Error fetching fare update:", fetchError);
      } else {
        console.log("Latest fare update:", fareData);
      }
    };

    // Test ride tracking update
    const testRideUpdate = async () => {
      // Insert new ride tracking
      const { error: insertError } = await window.supabaseClient
        .from("ride_tracking")
        .insert({
          service: "uber",
          status: "active",
          location: { lat: 40.7128, lng: -74.006 },
          eta: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        });

      if (insertError) {
        console.error("Error inserting ride update:", insertError);
        return;
      }

      // Fetch the latest ride tracking to verify
      const { data: rideData, error: fetchError } = await window.supabaseClient
        .from("ride_tracking")
        .select("*")
        .eq("service", "uber")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error("Error fetching ride update:", fetchError);
      } else {
        console.log("Latest ride tracking:", rideData);
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
