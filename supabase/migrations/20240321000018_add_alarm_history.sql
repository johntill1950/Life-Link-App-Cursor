-- Create alarm_history table
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
ALTER TABLE api.alarm_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own alarm history" ON api.alarm_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarm history" ON api.alarm_history
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