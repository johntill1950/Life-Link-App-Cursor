-- Drop existing settings table
DROP TABLE IF EXISTS public.settings CASCADE;

-- Create settings table with correct structure
CREATE TABLE public.settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    location_tracking_enabled BOOLEAN DEFAULT true,
    dark_mode_enabled BOOLEAN DEFAULT false,
    emergency_alerts_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings"
ON public.settings FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings"
ON public.settings FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add a policy for service role
CREATE POLICY "Service role can do everything"
ON public.settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role; 