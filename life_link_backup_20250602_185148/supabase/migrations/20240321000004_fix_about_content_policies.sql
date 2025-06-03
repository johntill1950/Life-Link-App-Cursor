-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin write access" ON public.about_content;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON public.about_content
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.about_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.about_content
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role; 