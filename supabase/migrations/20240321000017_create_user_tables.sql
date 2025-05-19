-- Create user_details table
CREATE TABLE IF NOT EXISTS api.user_details (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table
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

-- Create alarm_settings table
CREATE TABLE IF NOT EXISTS api.alarm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES api.user_details(id),
    last_alarm_time TIMESTAMP WITH TIME ZONE,
    alarm_cooldown_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE api.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.alarm_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own details" ON api.user_details
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own details" ON api.user_details
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own emergency contacts" ON api.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" ON api.emergency_contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alarm settings" ON api.alarm_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarm settings" ON api.alarm_settings
    FOR UPDATE USING (auth.uid() = user_id); 