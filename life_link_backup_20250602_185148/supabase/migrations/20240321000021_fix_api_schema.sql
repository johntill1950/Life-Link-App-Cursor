-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own details" ON public.user_details;
DROP POLICY IF EXISTS "Users can update their own details" ON public.user_details;
DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can view their own alarm settings" ON public.alarm_settings;
DROP POLICY IF EXISTS "Users can update their own alarm settings" ON public.alarm_settings;
DROP POLICY IF EXISTS "Users can view their own alarm history" ON public.alarm_history;
DROP POLICY IF EXISTS "Users can update their own alarm history" ON public.alarm_history;

-- Move tables from public to api schema
ALTER TABLE IF EXISTS public.about_content SET SCHEMA api;
ALTER TABLE IF EXISTS public.health_data SET SCHEMA api;
ALTER TABLE IF EXISTS public.profiles SET SCHEMA api;
ALTER TABLE IF EXISTS public.user_settings SET SCHEMA api;

-- Create user_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.user_details (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES api.user_details(id),
    contact_number INTEGER,
    name TEXT,
    phone TEXT,
    relationship TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alarm_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.alarm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES api.user_details(id),
    last_alarm_time TIMESTAMP WITH TIME ZONE,
    alarm_cooldown_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alarm_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.alarm_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES api.user_details(id),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    heart_rate INTEGER,
    movement_detected BOOLEAN,
    spo2 INTEGER,
    status TEXT DEFAULT 'triggered',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE api.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.alarm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.alarm_history ENABLE ROW LEVEL SECURITY;

-- Recreate policies in public schema
CREATE POLICY "Users can view their own details" ON public.user_details
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own details" ON public.user_details
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" ON public.emergency_contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alarm settings" ON public.alarm_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarm settings" ON public.alarm_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alarm history" ON public.alarm_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarm history" ON public.alarm_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Add validation functions
CREATE OR REPLACE FUNCTION api.validate_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone ~ '^\+?[0-9]{10,15}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION api.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraints to existing tables
ALTER TABLE api.user_details
    ADD CONSTRAINT valid_email CHECK (api.validate_email(email));

ALTER TABLE api.emergency_contacts
    ADD CONSTRAINT valid_phone CHECK (api.validate_phone(phone));

-- Update handle_new_user function to create user_details
CREATE OR REPLACE FUNCTION api.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO api.user_details (
        id,
        username,
        email,
        full_name
    )
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.email,
        new.raw_user_meta_data->>'full_name'
    );
    
    INSERT INTO api.user_settings (
        user_id,
        notifications_enabled,
        location_tracking_enabled,
        dark_mode_enabled,
        emergency_alerts_enabled
    )
    VALUES (
        new.id,
        true,
        true,
        false,
        true
    );
    
    RETURN new;
END;
$$; 