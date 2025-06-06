-- Create user_details table
CREATE TABLE IF NOT EXISTS public.user_details (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_details(id),
    contact_number INTEGER,
    name TEXT,
    phone TEXT,
    relationship TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alarm_settings table
CREATE TABLE IF NOT EXISTS public.alarm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_details(id),
    last_alarm_time TIMESTAMP WITH TIME ZONE,
    alarm_cooldown_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarm_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Users can access their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-docs'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-docs'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-docs'
  AND split_part(name, '/', 1) = auth.uid()::text
); 