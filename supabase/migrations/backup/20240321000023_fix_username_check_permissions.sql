-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own details" ON api.user_details;
DROP POLICY IF EXISTS "Users can update their own details" ON api.user_details;

-- Create new policies that allow username checking
CREATE POLICY "Enable read access for username checking"
    ON api.user_details
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own details"
    ON api.user_details
    FOR UPDATE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON api.user_details TO anon;
GRANT SELECT ON api.user_details TO authenticated; 