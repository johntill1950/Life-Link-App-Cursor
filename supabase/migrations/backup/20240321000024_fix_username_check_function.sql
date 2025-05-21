-- Drop the function if it exists in public schema
DROP FUNCTION IF EXISTS public.check_username_available(text);

-- Create the function in api schema
CREATE OR REPLACE FUNCTION api.check_username_available(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api
AS $$
DECLARE
    exists BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1 
        FROM user_details 
        WHERE LOWER(username) = LOWER($1)
    ) INTO exists;
    
    RETURN exists;
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION api.check_username_available(text) TO anon;
GRANT EXECUTE ON FUNCTION api.check_username_available(text) TO authenticated; 