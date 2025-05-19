-- Function to safely move a table if it doesn't exist in the target schema
CREATE OR REPLACE FUNCTION api.safe_move_table(
    source_schema text,
    target_schema text,
    table_name text
) RETURNS void AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables t
        WHERE t.table_schema = source_schema
        AND t.table_name = safe_move_table.table_name
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables t
        WHERE t.table_schema = target_schema
        AND t.table_name = safe_move_table.table_name
    ) THEN
        EXECUTE format('ALTER TABLE %I.%I SET SCHEMA %I', source_schema, table_name, target_schema);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Safely move tables
SELECT api.safe_move_table('public', 'api', 'about_content');
SELECT api.safe_move_table('public', 'api', 'health_data');
SELECT api.safe_move_table('public', 'api', 'profiles');
SELECT api.safe_move_table('public', 'api', 'user_settings');

-- Drop the temporary function
DROP FUNCTION api.safe_move_table(text, text, text); 