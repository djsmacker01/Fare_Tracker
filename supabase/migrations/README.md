# Database Migrations

This directory contains all database migrations for the Fare Tracker application. Migrations are used to track and apply changes to the database schema.

## Naming Convention

Migrations should be named using the following format:
```YYYYMMDDHHMMSS_description.sql
```

Example: `20240320143000_create_ride_tracking_table.sql`

## Migration Types

1. **Schema Changes** (`create_`, `alter_`, `drop_`)
   - Table creation
   - Column modifications
   - Index creation/deletion
   - Constraint changes

2. **Data Changes** (`seed_`, `update_`)
   - Initial data population
   - Data updates
   - Reference data

## What to Commit

✅ **DO Commit**:
- Table structure changes
- Index creations
- Constraint definitions
- Function definitions
- Trigger definitions
- View definitions

❌ **DON'T Commit**:
- Sample data
- Test data
- Sensitive information
- API keys
- Environment-specific data

## Migration Process

1. Create a new migration file using the naming convention
2. Write your SQL changes
3. Test the migration locally
4. Commit the migration file
5. Apply the migration to your Supabase project

## Example Migration

```sql
-- 20240320143000_create_ride_tracking_table.sql
create table if not exists ride_tracking (
    id uuid default uuid_generate_v4() primary key,
    service text not null,
    status text not null,
    location jsonb,
    eta timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable real-time
alter table ride_tracking replica identity full;

-- Create indexes
create index if not exists idx_ride_tracking_service on ride_tracking(service);
```

## Running Migrations

To apply migrations to your Supabase project:

1. Using Supabase CLI:
   ```bash
   supabase db push
   ```

2. Using the Supabase Dashboard:
   - Go to SQL Editor
   - Copy the migration SQL
   - Run the query

## Rollback

To rollback a migration:

1. Create a new migration with the reverse changes
2. Name it with a timestamp after the original migration
3. Apply the rollback migration

Example:
```sql
-- 20240320143001_rollback_ride_tracking_table.sql
drop table if exists ride_tracking;
``` 