"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from "next/navigation";

export default function ContentEditsPage() {
  const { user, loading } = useUser();
  const [defaults, setDefaults] = useState({
    medical_history_default: '',
    medications_default: '',
    special_notes_default: '',
    about_content: '',
    help_content: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.is_admin === undefined) {
        const fetchProfile = async () => {
          const supabase = getSupabaseClient();
          const { data } = await supabase
            .from('profile')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          setIsAdmin(!!data?.is_admin);
        };
        fetchProfile();
      } else {
        setIsAdmin(!!user.is_admin);
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && isAdmin === false) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    const fetchDefaults = async () => {
      const supabase = getSupabaseClient();
      // Fetch profile_defaults
      const { data: profileDefaults, error: defaultsError } = await supabase
        .from('profile_defaults')
        .select('*')
        .limit(1)
        .single();
      // Fetch about_content for about/help
      const { data: aboutRows, error: aboutError } = await supabase
        .from('about_content')
        .select('section, content');
      let about_content = '';
      let help_content = '';
      if (aboutRows && Array.isArray(aboutRows)) {
        const aboutRow = aboutRows.find((row: any) => row.section === 'about');
        const helpRow = aboutRows.find((row: any) => row.section === 'help');
        about_content = aboutRow?.content || '';
        help_content = helpRow?.content || '';
      }
      setDefaults({
        medical_history_default: profileDefaults?.medical_history_default || '',
        medications_default: profileDefaults?.medications_default || '',
        special_notes_default: profileDefaults?.special_notes_default || '',
        about_content,
        help_content
      });
      if (defaultsError || aboutError) setError('Failed to load defaults');
    };
    fetchDefaults();
  }, []);

  const handleChange = (field: string, value: string) => {
    setDefaults(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = getSupabaseClient();
    // Update profile_defaults
    const { error: defaultsError } = await supabase
      .from('profile_defaults')
      .update({
        medical_history_default: defaults.medical_history_default,
        medications_default: defaults.medications_default,
        special_notes_default: defaults.special_notes_default
      })
      .eq('id', 1);
    // Upsert about_content for about/help
    const { error: aboutError } = await supabase
      .from('about_content')
      .upsert([
        { section: 'about', content: defaults.about_content },
        { section: 'help', content: defaults.help_content }
      ], { onConflict: ['section'] });
    if (defaultsError || aboutError) setError('Failed to save changes');
    else setSuccess(true);
    setSaving(false);
  };

  if (loading || isAdmin === null) return <div>Loading...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Profile Default Texts</h1>
      <p className="mb-6 text-sm text-gray-600">These defaults are shown to users who have not yet edited their own fields. Changes here do not affect users who have already saved their own information.</p>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Relevant Medical History</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[80px]"
            value={defaults.medical_history_default}
            onChange={e => handleChange('medical_history_default', e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Current Medications</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[80px]"
            value={defaults.medications_default}
            onChange={e => handleChange('medications_default', e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Special Notes</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[80px]"
            value={defaults.special_notes_default}
            onChange={e => handleChange('special_notes_default', e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">About Content</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[80px]"
            value={defaults.about_content}
            onChange={e => handleChange('about_content', e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Help Content</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[80px]"
            value={defaults.help_content}
            onChange={e => handleChange('help_content', e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">Defaults updated!</div>}
      </form>
    </div>
  );
} 