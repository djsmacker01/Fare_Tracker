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

    // Get request body
    const text = await req.text()
    console.log('Raw request body:', text)

    // Validate request body
    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'Empty request body',
          details: 'The request body is empty or contains only whitespace'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          details: e.message,
          receivedText: text
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('Parsed request body:', body)

    // Validate required fields
    if (!body.pickup || !body.dropoff) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Request must include pickup and dropoff locations',
          receivedBody: body
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!body.pickup.lat || !body.pickup.lng || !body.dropoff.lat || !body.dropoff.lng) {
      return new Response(
        JSON.stringify({
          error: 'Invalid location format',
          details: 'Pickup and dropoff must include lat and lng coordinates',
          receivedBody: body
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { pickup, dropoff } = body

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

    if (fareError) {
      console.error('Fare update error:', fareError)
      throw fareError
    }

    // Store driver location with some random variation
    const { data: driverLocation, error: driverError } = await supabaseClient
      .from('ride_tracking')
      .insert({
        service: 'uber',
        driver_id: uberData.prices[0].product_id,
        location: {
          lat: pickup.lat + (Math.random() - 0.5) * 0.01,
          lng: pickup.lng + (Math.random() - 0.5) * 0.01
        },
        status: 'available',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (driverError) {
      console.error('Driver location error:', driverError)
      throw driverError
    }

    return new Response(
      JSON.stringify({
        success: true,
        fareUpdate,
        driverLocation,
        mockData: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Function error',
        details: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 