-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin write access" ON public.about_content;

-- Recreate policies with proper schema
DROP POLICY IF EXISTS "Enable read access for all users" ON public.about_content;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.about_content;

CREATE POLICY "Enable read access for all users" ON public.about_content
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.about_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;

-- Update RLS settings
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY; 