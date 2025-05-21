-- Create alarm_history table
CREATE TABLE IF NOT EXISTS public.alarm_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_details(id),
    alarm_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    heart_rate INTEGER,
    spo2 INTEGER,
    motion_level INTEGER,
    status TEXT CHECK (status IN ('triggered', 'cancelled', 'responded', 'escalated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.alarm_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own alarm history" ON public.alarm_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alarm history" ON public.alarm_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarm history" ON public.alarm_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Add validation functions
CREATE OR REPLACE FUNCTION public.validate_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone ~ '^\+?[0-9]{10,15}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.validate_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN username ~ '^[A-Za-z0-9_]{3,20}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_phone(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_email(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_username(TEXT) TO service_role;

-- Add constraints to existing tables
ALTER TABLE public.user_details
    ADD CONSTRAINT valid_email CHECK (public.validate_email(email));

ALTER TABLE public.emergency_contacts
    ADD CONSTRAINT valid_phone CHECK (public.validate_phone(phone)); 