-- Create profile for dev user
INSERT INTO public.profiles (id, username, email, full_name, emergency_contact, is_admin, created_at)
SELECT 
  id,
  'devuser',
  email,
  'Development User',
  'emergency@example.com',
  true,
  NOW()
FROM auth.users
WHERE email = 'dev.user@lifelink.app'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  emergency_contact = EXCLUDED.emergency_contact,
  is_admin = EXCLUDED.is_admin;

-- Add unique constraint on user_id
ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_key UNIQUE (user_id);

-- Create settings for dev user
INSERT INTO public.settings (user_id, notifications_enabled, location_tracking_enabled, dark_mode_enabled, emergency_alerts_enabled)
SELECT 
  id,
  true,
  true,
  false,
  true
FROM auth.users
WHERE email = 'dev.user@lifelink.app'
ON CONFLICT (user_id) DO UPDATE SET
  notifications_enabled = EXCLUDED.notifications_enabled,
  location_tracking_enabled = EXCLUDED.location_tracking_enabled,
  dark_mode_enabled = EXCLUDED.dark_mode_enabled,
  emergency_alerts_enabled = EXCLUDED.emergency_alerts_enabled; 