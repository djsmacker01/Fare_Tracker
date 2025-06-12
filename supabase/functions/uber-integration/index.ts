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
  // Log request details
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? ''
    )

    // Get request body with error handling
    let requestData
    try {
      requestData = await req.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      throw new Error('Invalid JSON in request body')
    }

    const { pickup, dropoff } = requestData

    // Validate required fields
    if (!pickup || !dropoff || !pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
      throw new Error('Missing required pickup or dropoff coordinates')
    }

    console.log('Processing request with:', { pickup, dropoff })

    // Use mock data instead of real API call
    const uberData = mockUberData
    console.log('Using mock data:', uberData)

    // Store fare update
    const { data: fareUpdate, error: fareError } = await supabaseClient
      .from('fare_updates')
      .insert({
        service: 'uber',
        price: uberData.prices[0].estimate,
        change_percentage: 0, // No change for initial price
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (fareError) {
      console.error('Fare update error:', fareError)
      throw fareError
    }

    // Store driver location (using a more realistic approach)
    const { data: driverLocation, error: driverError } = await supabaseClient
      .from('ride_tracking')
      .insert({
        service: 'uber',
        status: 'available',
        location: {
          lat: pickup.lat,
          lng: pickup.lng
        },
        eta: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (driverError) {
      console.error('Driver location error:', driverError)
      throw driverError
    }

    return new Response(JSON.stringify({
      success: true,
      fareUpdate,
      driverLocation,
      mockData: true,
      uberResponse: uberData // Include for debugging
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    })
  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    })
  }
}) 