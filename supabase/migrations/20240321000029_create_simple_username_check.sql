-- Drop any existing functions
DROP FUNCTION IF EXISTS public.check_username(text);
DROP FUNCTION IF EXISTS public.check_username_available(text);
DROP FUNCTION IF EXISTS api.check_username_available(text);

-- Create a new function with a simple name
CREATE OR REPLACE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 
        FROM user_details 
        WHERE LOWER(username) = LOWER(p_username)
    );
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO service_role; 