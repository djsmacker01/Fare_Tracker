// Wait for Supabase to be loaded
function waitForSupabase() {
  return new Promise((resolve) => {
    if (typeof supabase !== "undefined") {
      resolve();
    } else {
      const checkSupabase = setInterval(() => {
        if (typeof supabase !== "undefined") {
          clearInterval(checkSupabase);
          resolve();
        }
      }, 100);
    }
  });
}

// Initialize Supabase client
async function initSupabase() {
  await waitForSupabase();

  const supabaseUrl = "https://bcemiehsozdgzspvwkjk.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZW1pZWhzb3pkZ3pzcHZ3a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjI1ODYsImV4cCI6MjA2NTI5ODU4Nn0.E6LTwwRwpQbeL37U2uXJ7ZxnQiaAe2FZwFLKhkBjUl8";

  window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized");
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", initSupabase);
