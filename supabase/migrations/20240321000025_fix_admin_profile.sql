-- Update the user's profile to set is_admin to true
UPDATE public.profiles
SET is_admin = true
WHERE id = 'e909158e-396a-40be-9ada-08345e687b68';

-- Also ensure the RLS policies are correct
DROP POLICY IF EXISTS "Enable insert for admins" ON public.about_content;
DROP POLICY IF EXISTS "Enable update for admins" ON public.about_content;

CREATE POLICY "Enable insert for admins" 
    ON public.about_content 
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Enable update for admins" 
    ON public.about_content 
    FOR UPDATE 
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    ); 