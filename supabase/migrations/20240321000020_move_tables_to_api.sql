-- Move tables from public to api schema
-- ALTER TABLE public.about_content SET SCHEMA api;
-- ALTER TABLE public.health_data SET SCHEMA api;
-- ALTER TABLE public.profiles SET SCHEMA api;
-- ALTER TABLE public.user_settings SET SCHEMA api;

-- Move function to api schema
ALTER FUNCTION public.handle_new_user() SET SCHEMA api;

-- Update function to reference api schema
CREATE OR REPLACE FUNCTION api.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO api.profiles (
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
    
    INSERT INTO api.user_settings (
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
$$; 