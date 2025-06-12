import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI prediction model (simplified for example)
const predictPrice = (historicalData: any[], currentPrice: number) => {
  // Simple moving average calculation
  const prices = historicalData.map(d => d.price)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length
  const trend = currentPrice > avg ? 'rising' : 'falling'
  
  // Calculate confidence based on price volatility
  const volatility = Math.sqrt(
    prices.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / prices.length
  )
  const confidence = Math.max(0, 100 - (volatility * 10))

  return {
    trend,
    confidence,
    predictedPrice: currentPrice * (trend === 'rising' ? 1.1 : 0.9)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get latest fare updates
    const { data: fareUpdates, error: fareError } = await supabaseClient
      .from('fare_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (fareError) throw fareError

    // Process each service's data
    const services = ['uber', 'bolt', 'taxi']
    const processedData = {}

    for (const service of services) {
      const serviceData = fareUpdates.filter(update => update.service === service)
      
      if (serviceData.length > 0) {
        const latestPrice = serviceData[0].price
        const prediction = predictPrice(serviceData, latestPrice)

        // Store prediction
        await supabaseClient
          .from('price_predictions')
          .insert({
            service,
            current_price: latestPrice,
            predicted_price: prediction.predictedPrice,
            trend: prediction.trend,
            confidence: prediction.confidence,
            created_at: new Date().toISOString()
          })

        processedData[service] = {
          currentPrice: latestPrice,
          prediction
        }
      }
    }

    // Generate insights based on processed data
    const insights = []
    
    // Price comparison insight
    const prices = Object.values(processedData).map(d => d.currentPrice)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceDiff = ((maxPrice - minPrice) / minPrice) * 100

    if (priceDiff > 20) {
      insights.push({
        type: 'price_comparison',
        message: `Price difference of ${priceDiff.toFixed(1)}% between services`,
        priority: 'high'
      })
    }

    // Trend insight
    const trends = Object.values(processedData).map(d => d.prediction.trend)
    if (trends.every(t => t === 'rising')) {
      insights.push({
        type: 'trend',
        message: 'All services showing rising prices',
        priority: 'medium'
      })
    }

    // Store insights
    if (insights.length > 0) {
      await supabaseClient
        .from('insights')
        .insert(insights.map(insight => ({
          ...insight,
          created_at: new Date().toISOString()
        })))
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        insights 
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