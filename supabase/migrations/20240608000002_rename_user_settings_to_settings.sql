-- Rename the table
ALTER TABLE public.user_settings RENAME TO settings;

-- If there are foreign keys in other tables referencing user_settings, update them as well
-- Example (uncomment and edit as needed):
-- ALTER TABLE public.some_other_table RENAME CONSTRAINT some_other_table_user_settings_fkey TO some_other_table_settings_fkey; 