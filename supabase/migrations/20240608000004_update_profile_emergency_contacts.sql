-- Add new columns for emergency contact names and phones
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS emergency_contact1_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact1_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact2_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact2_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact3_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact3_phone TEXT;

-- (Optional) If you have old columns like emergency_contact1, migrate data
-- UPDATE public.profile
--   SET emergency_contact1_name = emergency_contact1,
--       emergency_contact2_name = emergency_contact2,
--       emergency_contact3_name = emergency_contact3;

-- (Optional) Remove old columns if no longer needed
-- ALTER TABLE public.profile
--   DROP COLUMN IF EXISTS emergency_contact1,
--   DROP COLUMN IF EXISTS emergency_contact2,
--   DROP COLUMN IF EXISTS emergency_contact3; 