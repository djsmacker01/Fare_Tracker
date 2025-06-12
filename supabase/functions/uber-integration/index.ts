import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock data for testing
const mockUberData = {
  prices: [
    {
      product_id: 'mock-uber-x',
      estimate: 25.50,
      currency_code: 'USD',
      duration: 1800,
      distance: 5.2
    },
    {
      product_id: 'mock-uber-comfort',
      estimate: 30.75,
      currency_code: 'USD',
      duration: 1800,
      distance: 5.2
    }
  ]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? ''
    )

    // Get request body with better error handling
    let body;
    try {
      const text = await req.text();
      body = JSON.parse(text);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { pickup, dropoff } = body;

    // Validate required fields
    if (!pickup || !dropoff || !pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: pickup and dropoff locations' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Use mock data instead of real API call
    const uberData = mockUberData

    // Store fare update
    const { data: fareUpdate, error: fareError } = await supabaseClient
      .from('fare_updates')
      .insert({
        service: 'uber',
        price: uberData.prices[0].estimate,
        currency: uberData.prices[0].currency_code,
        pickup_location: pickup,
        dropoff_location: dropoff,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (fareError) throw fareError

    // Store driver location with some random variation
    const { data: driverLocation, error: driverError } = await supabaseClient
      .from('ride_tracking')
      .insert({
        service: 'uber',
        driver_id: uberData.prices[0].product_id,
        location: {
          lat: pickup.lat + (Math.random() - 0.5) * 0.01, // Add small random variation
          lng: pickup.lng + (Math.random() - 0.5) * 0.01
        },
        status: 'available',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (driverError) throw driverError

    return new Response(
      JSON.stringify({ 
        success: true, 
        fareUpdate,
        driverLocation,
        mockData: true // Indicate that we're using mock data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 