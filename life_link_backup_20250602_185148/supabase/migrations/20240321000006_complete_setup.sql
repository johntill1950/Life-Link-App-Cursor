-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.about_content CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.health_data CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    emergency_contact text,
    role text DEFAULT 'user',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create health_data table
CREATE TABLE public.health_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    heart_rate integer NOT NULL,
    oxygen_saturation integer NOT NULL,
    movement integer NOT NULL,
    latitude double precision,
    longitude double precision,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_settings table
CREATE TABLE public.user_settings (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    notifications boolean DEFAULT true,
    location_tracking boolean DEFAULT true,
    dark_mode boolean DEFAULT false,
    emergency_alerts boolean DEFAULT true,
    data_sharing boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create about_content table
CREATE TABLE public.about_content (
    id integer PRIMARY KEY,
    about text,
    help text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for health_data
CREATE POLICY "Users can view own health data"
    ON public.health_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
    ON public.health_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for about_content
CREATE POLICY "Enable read access for all users"
    ON public.about_content FOR SELECT
    USING (true);

CREATE POLICY "Enable write access for authenticated users"
    ON public.about_content FOR ALL
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.health_data TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.about_content TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.health_data TO service_role;
GRANT ALL ON public.user_settings TO service_role;
GRANT ALL ON public.about_content TO service_role;

-- Insert initial about content
INSERT INTO public.about_content (id, about, help)
VALUES (1, 'Welcome to Life-Link-app!', 'Here''s how you can help...')
ON CONFLICT (id) DO NOTHING;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 