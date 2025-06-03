-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS about_content CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS health_data CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    full_name TEXT,
    emergency_contact TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create health_data table
CREATE TABLE health_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    heart_rate INTEGER,
    oxygen_saturation INTEGER,
    movement INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    notifications_enabled BOOLEAN DEFAULT true,
    location_tracking_enabled BOOLEAN DEFAULT true,
    dark_mode_enabled BOOLEAN DEFAULT false,
    emergency_alerts_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create about_content table
CREATE TABLE about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT UNIQUE,
    content TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING ((auth.jwt() ->> 'role') = 'admin');

-- Create policies for health_data
CREATE POLICY "Users can view own health data" 
ON health_data FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" 
ON health_data FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can view own settings" 
ON user_settings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON user_settings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policies for about_content
CREATE POLICY "Anyone can view about content" 
ON about_content FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can update about content" 
ON about_content FOR UPDATE 
TO authenticated 
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can insert about content" 
ON about_content FOR INSERT 
TO authenticated 
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Insert initial about content
INSERT INTO about_content (section, content)
VALUES 
    ('about', 'Welcome to Life Link - Your Health Monitoring Companion'),
    ('help', 'Need help? Contact our support team.')
ON CONFLICT (section) DO NOTHING; 