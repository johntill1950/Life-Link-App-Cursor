-- Insert new user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'monina.till@example.com',
  crypt('HubbyBear', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Monina Till","username":"WifyBear","address1":"1 Jan St"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile for the new user
INSERT INTO public.profiles (
  id,
  username,
  full_name,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'monina.till@example.com'),
  'WifyBear',
  'Monina Till',
  now()
);

-- Create user settings for the new user
INSERT INTO public.user_settings (
  id,
  notifications_enabled,
  location_tracking_enabled,
  dark_mode_enabled,
  emergency_alerts_enabled,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'monina.till@example.com'),
  true,
  true,
  false,
  true,
  now()
); 