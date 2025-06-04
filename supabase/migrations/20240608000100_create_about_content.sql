-- Create about_content table for About and Help sections
CREATE TABLE IF NOT EXISTS public.about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT UNIQUE,
    content TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert initial content
INSERT INTO public.about_content (section, content)
VALUES 
    ('about', 'Welcome to Life Link - Your Health Monitoring Companion'),
    ('help', 'Need help? Contact our support team.')
ON CONFLICT (section) DO NOTHING;

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Allow only admins to insert and update about_content
CREATE POLICY "Admins can modify about_content"
ON public.about_content
FOR ALL
USING ((auth.jwt() ->> 'role') = 'admin');

-- Grant privileges to authenticated users
GRANT INSERT, UPDATE, SELECT ON public.about_content TO authenticated; 