const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://bcemiehsozdgzspvwkjk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZW1pZWhzb3pkZ3pzcHZ3a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjI1ODYsImV4cCI6MjA2NTI5ODU4Nn0.E6LTwwRwpQbeL37U2uXJ7ZxnQiaAe2FZwFLKhkBjUl8";

const hasRequiredCredentials = supabaseUrl && supabaseKey;
if (!hasRequiredCredentials) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
