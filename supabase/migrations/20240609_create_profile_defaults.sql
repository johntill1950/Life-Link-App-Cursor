CREATE TABLE IF NOT EXISTS profile_defaults (
  id serial PRIMARY KEY,
  medical_history_default text NOT NULL DEFAULT 'Please list any chronic illnesses, allergies, or past surgeries that emergency responders should know about.',
  medications_default text NOT NULL DEFAULT 'List all medications you are currently taking, including dosage and frequency.',
  special_notes_default text NOT NULL DEFAULT 'Add any other important information, such as language needs, religious considerations, or special instructions.'
);

-- Insert a single row if table is empty
INSERT INTO profile_defaults (medical_history_default, medications_default, special_notes_default)
SELECT 'Please list any chronic illnesses, allergies, or past surgeries that emergency responders should know about.',
       'List all medications you are currently taking, including dosage and frequency.',
       'Add any other important information, such as language needs, religious considerations, or special instructions.'
WHERE NOT EXISTS (SELECT 1 FROM profile_defaults); 