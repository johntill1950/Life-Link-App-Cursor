-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view about content" ON public.about_content;
DROP POLICY IF EXISTS "Only admins can update about content" ON public.about_content;
DROP POLICY IF EXISTS "Only admins can insert about content" ON public.about_content;

-- Create new policies
-- Allow anyone to read
CREATE POLICY "Enable read access for all users" 
    ON public.about_content 
    FOR SELECT 
    USING (true);

-- Allow admins to insert
CREATE POLICY "Enable insert for admins" 
    ON public.about_content 
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    );

-- Allow admins to update
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