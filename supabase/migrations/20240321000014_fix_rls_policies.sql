-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy for settings
CREATE POLICY "Users can view their own settings"
ON public.settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow insert for authenticated users
CREATE POLICY "Users can insert their own settings"
ON public.settings
FOR INSERT
WITH CHECK (auth.uid() = user_id); 