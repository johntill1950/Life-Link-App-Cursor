-- Create about_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.about_content (
    id INTEGER PRIMARY KEY,
    about TEXT,
    help TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial data if table is empty
INSERT INTO public.about_content (id, about, help)
VALUES (1, 'Welcome to Life-Link-app!', 'Here''s how you can help...')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin write access" ON public.about_content;

-- Allow anyone to read
CREATE POLICY "Allow public read access" ON public.about_content
    FOR SELECT USING (true);

-- Allow admin to write
CREATE POLICY "Allow admin write access" ON public.about_content
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    ); 