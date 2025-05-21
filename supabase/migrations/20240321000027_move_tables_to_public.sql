-- Move user_details table from api to public schema
ALTER TABLE IF EXISTS api.user_details SET SCHEMA public;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for username checking" ON public.user_details;
DROP POLICY IF EXISTS "Users can update their own details" ON public.user_details;

-- Create new policies
CREATE POLICY "Enable read access for username checking"
    ON public.user_details
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own details"
    ON public.user_details
    FOR UPDATE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON public.user_details TO anon;
GRANT SELECT ON public.user_details TO authenticated;
GRANT SELECT ON public.user_details TO service_role; 