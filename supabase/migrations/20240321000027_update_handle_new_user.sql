-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        username,
        email,
        full_name,
        is_admin
    )
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.email,
        new.raw_user_meta_data->>'full_name',
        (new.raw_user_meta_data->>'role') = 'admin'
    );
    
    INSERT INTO public.settings (
        user_id,
        notifications_enabled,
        location_tracking_enabled,
        dark_mode_enabled,
        emergency_alerts_enabled
    )
    VALUES (
        new.id,
        true,
        true,
        false,
        true
    );
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 