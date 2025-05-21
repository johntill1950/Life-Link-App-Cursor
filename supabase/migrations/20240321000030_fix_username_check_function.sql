-- Drop any existing functions
DROP FUNCTION IF EXISTS public.is_username_available(text);
DROP FUNCTION IF EXISTS public.check_username(text);
DROP FUNCTION IF EXISTS public.check_username_available(text);
DROP FUNCTION IF EXISTS api.check_username_available(text);

-- Create a new function with a simpler name
CREATE OR REPLACE FUNCTION public.check_username_exists(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_details 
        WHERE LOWER(username) = LOWER(username_to_check)
    );
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO service_role; 