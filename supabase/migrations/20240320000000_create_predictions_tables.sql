-- Create price_predictions table
CREATE TABLE price_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    predicted_price DECIMAL(10,2) NOT NULL,
    trend TEXT NOT NULL CHECK (trend IN ('rising', 'falling', 'stable')),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_prices CHECK (current_price > 0 AND predicted_price > 0)
);

-- Create insights table
CREATE TABLE insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_price_predictions_service ON price_predictions(service);
CREATE INDEX idx_price_predictions_created_at ON price_predictions(created_at);
CREATE INDEX idx_insights_priority ON insights(priority);
CREATE INDEX idx_insights_created_at ON insights(created_at);

-- Enable real-time for both tables
ALTER TABLE price_predictions REPLICA IDENTITY FULL;
ALTER TABLE insights REPLICA IDENTITY FULL;

-- Add RLS policies
ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON price_predictions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON insights
    FOR SELECT TO authenticated USING (true);

-- Allow insert access to service role only
CREATE POLICY "Allow insert access to service role" ON price_predictions
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow insert access to service role" ON insights
    FOR INSERT TO service_role WITH CHECK (true); 