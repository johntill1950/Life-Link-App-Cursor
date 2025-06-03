-- Drop the table if it exists in any schema
DROP TABLE IF EXISTS public.about_content CASCADE;
DROP TABLE IF EXISTS api.about_content CASCADE;

-- Create the table in public schema
CREATE TABLE public.about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT UNIQUE,
    content TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert initial content
INSERT INTO public.about_content (section, content)
VALUES 
    ('about', '<h2>About Life-Link.app</h2><p>This is <b>dummy about text</b> for demonstration. You can edit this as an admin.</p>'),
    ('help', '<h2>Help</h2><ul><li>Contact support at support@example.com</li><li>Read the FAQ</li></ul>')
ON CONFLICT (section) DO NOTHING;

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.about_content;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.about_content;
DROP POLICY IF EXISTS "Enable update for admins" ON public.about_content;

-- Create new policies
CREATE POLICY "Enable read access for all users" 
    ON public.about_content 
    FOR SELECT 
    USING (true);

CREATE POLICY "Enable insert for admins" 
    ON public.about_content 
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Enable update for admins" 
    ON public.about_content 
    FOR UPDATE 
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    );

-- Grant necessary permissions
GRANT ALL ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role; 