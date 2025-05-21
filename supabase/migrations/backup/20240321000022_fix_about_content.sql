-- Drop old table if it exists
DROP TABLE IF EXISTS public.about_content CASCADE;

-- Create the correct table
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

-- Create RLS policies
CREATE POLICY "Anyone can view about content" 
    ON public.about_content FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Only admins can update about content" 
    ON public.about_content FOR UPDATE 
    TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can insert about content" 
    ON public.about_content FOR INSERT 
    TO authenticated 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin'); 