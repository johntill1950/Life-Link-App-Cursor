-- Function to safely move a table if it doesn't exist in the target schema
CREATE OR REPLACE FUNCTION public.safe_move_table(
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.safe_move_table(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_move_table(text, text, text) TO service_role;

-- Move tables from api to public schema if they exist
SELECT public.safe_move_table('api', 'public', 'user_details');
SELECT public.safe_move_table('api', 'public', 'emergency_contacts');
SELECT public.safe_move_table('api', 'public', 'alarm_settings');
SELECT public.safe_move_table('api', 'public', 'alarm_history');

-- Drop the temporary function
DROP FUNCTION IF EXISTS public.safe_move_table(text, text, text); 