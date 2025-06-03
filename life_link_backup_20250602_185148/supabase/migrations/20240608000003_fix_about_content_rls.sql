-- Enable RLS if not already enabled
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Drop existing insert and update policies if they exist
DROP POLICY IF EXISTS "Allow admin update access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.about_content;
DROP POLICY IF EXISTS "Admins can modify about_content" ON public.about_content;

-- Allow only admins to insert and update about_content
CREATE POLICY "Admins can modify about_content"
ON public.about_content
FOR ALL
USING ((auth.jwt() ->> 'role') = 'admin');

-- Grant privileges to authenticated users
GRANT INSERT, UPDATE, SELECT ON public.about_content TO authenticated; 