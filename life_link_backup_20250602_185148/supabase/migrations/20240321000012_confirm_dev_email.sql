-- Confirm email for development user
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email = 'dev@example.com'; 