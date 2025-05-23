import { useEffect, useState } from 'react';
import { getSupabaseClient } from './supabase';
import { useUser } from './useUser';

export function useUserSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) {
        setSettings(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setSettings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch settings');
        setSettings(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  return { settings, loading, error };
} 