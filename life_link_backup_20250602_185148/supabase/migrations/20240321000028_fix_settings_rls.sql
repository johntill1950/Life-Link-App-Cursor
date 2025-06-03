-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;

-- Create new policies
CREATE POLICY "Users can view their own settings"
ON public.settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add a policy for service role
CREATE POLICY "Service role can do everything"
ON public.settings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role; 