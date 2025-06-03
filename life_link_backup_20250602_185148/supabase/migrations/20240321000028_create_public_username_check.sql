-- Create a new function in public schema
CREATE OR REPLACE FUNCTION public.check_username(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api
AS $$
DECLARE
    exists BOOLEAN;
BEGIN
    -- Check if username exists in user_details table
    SELECT EXISTS (
        SELECT 1 
        FROM user_details 
        WHERE LOWER(username) = LOWER($1)
    ) INTO exists;
    
    -- Return true if username is available (doesn't exist)
    RETURN NOT exists;
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.check_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username(text) TO service_role; 