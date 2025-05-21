-- Create function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exists BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1 
        FROM api.user_details 
        WHERE LOWER(username) = LOWER($1)
    ) INTO exists;
    
    RETURN exists;
END;
$$; 