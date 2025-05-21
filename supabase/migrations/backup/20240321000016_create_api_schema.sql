-- Create the api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Grant usage to authenticated users and service role
GRANT USAGE ON SCHEMA api TO authenticated;
GRANT USAGE ON SCHEMA api TO service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT ALL ON TABLES TO service_role; 