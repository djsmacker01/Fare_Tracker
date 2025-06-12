-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ride_tracking table
create table if not exists ride_tracking (
    id uuid default uuid_generate_v4() primary key,
    service text not null,
    status text not null,
    location jsonb,
    eta timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable real-time for ride_tracking table
alter table ride_tracking replica identity full;

-- Create fare_updates table
create table if not exists fare_updates (
    id uuid default uuid_generate_v4() primary key,
    service text not null,
    price decimal not null,
    change_percentage decimal,
    created_at timestamp with time zone default now()
);

-- Enable real-time for fare_updates table
alter table fare_updates replica identity full;

-- Create price_predictions table
create table if not exists price_predictions (
    id uuid default uuid_generate_v4() primary key,
    service text not null,
    current_price decimal(10,2) not null,
    predicted_price decimal(10,2) not null,
    trend text not null check (trend in ('rising', 'falling', 'stable')),
    confidence integer not null check (confidence >= 0 and confidence <= 100),
    created_at timestamp with time zone default now(),
    constraint valid_prices check (current_price > 0 and predicted_price > 0)
);

-- Create insights table
create table if not exists insights (
    id uuid default uuid_generate_v4() primary key,
    type text not null,
    message text not null,
    priority text not null check (priority in ('low', 'medium', 'high')),
    created_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists idx_ride_tracking_service on ride_tracking(service);
create index if not exists idx_fare_updates_service on fare_updates(service);
create index if not exists idx_price_predictions_service on price_predictions(service);
create index if not exists idx_price_predictions_created_at on price_predictions(created_at);
create index if not exists idx_insights_priority on insights(priority);
create index if not exists idx_insights_created_at on insights(created_at);

-- Create function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update the updated_at column
create trigger update_ride_tracking_updated_at
    before update on ride_tracking
    for each row
    execute function update_updated_at_column();

-- Enable real-time for all tables
alter table price_predictions replica identity full;
alter table insights replica identity full;

-- Add RLS policies
alter table price_predictions enable row level security;
alter table insights enable row level security;

-- Allow read access to authenticated users
create policy "Allow read access to authenticated users" on price_predictions
    for select to authenticated using (true);

create policy "Allow read access to authenticated users" on insights
    for select to authenticated using (true);

-- Allow insert access to service role only
create policy "Allow insert access to service role" on price_predictions
    for insert to service_role with check (true);

create policy "Allow insert access to service role" on insights
    for insert to service_role with check (true); 