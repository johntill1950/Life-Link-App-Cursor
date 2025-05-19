-- Confirm the development user's email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'dev.user@lifelink.app';

-- Also ensure the user has admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'dev.user@lifelink.app'; 