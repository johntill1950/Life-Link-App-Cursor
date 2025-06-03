"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { fetchUserProfile, upsertUserProfile } from "@/lib/userService";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from '@/lib/supabase';

const initialProfile = {
  full_name: "",
  address1: "",
  address2: "",
  address3: "",
  country: "",
  postal_code: "",
  emergency_contact1_name: "",
  emergency_contact1_phone: "",
  emergency_contact2_name: "",
  emergency_contact2_phone: "",
  emergency_contact3_name: "",
  emergency_contact3_phone: "",
  medical_history: "",
  medications: "",
  special_notes: "",
};

type ProfileType = typeof initialProfile;

interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileType>({ ...initialProfile });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', email: '', relationship: '' },
    { name: '', phone: '', email: '', relationship: '' },
    { name: '', phone: '', email: '', relationship: '' }
  ]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchProfileData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile(user.id);
        if (mounted) {
          const sanitized: ProfileType = { ...initialProfile, ...data };
          setProfile(sanitized);
        }
      } catch (err: any) {
        if (mounted) {
          setError("Failed to load profile");
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };

    const attemptFetch = async () => {
      if (!user && !userLoading) {
        if (retryCount < maxRetries) {
          retryCount++;
          // Wait a bit before retrying
          setTimeout(attemptFetch, 1000);
          return;
        }
        router.push('/');
        return;
      }
      if (user) {
        await fetchProfileData();
      }
    };

    attemptFetch();

    return () => {
      mounted = false;
    };
  }, [user, userLoading, router]);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    if (!user) {
      setError("Not logged in");
      setSaving(false);
      return;
    }
    // Validate phone numbers
    const phoneFields = ['emergency_contact1_phone', 'emergency_contact2_phone', 'emergency_contact3_phone'];
    for (const field of phoneFields) {
      const phone = profile[field];
      if (phone && !/^0\d{9}$|^0\d{1} \d{9}$|^0\d{1} \d{8}$/.test(phone)) {
        setError(`Please ensure ${field.replace('_', ' ')} is in format: 0123456789, 01 123456789, or 01 12345678`);
        setSaving(false);
        return;
      }
    }
    try {
      await upsertUserProfile(user.id, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError("Please check all details and save again");
    }
    setSaving(false);
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...emergencyContacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setEmergencyContacts(newContacts);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveEmergencyContacts = async () => {
    try {
      // Validate emails
      for (const contact of emergencyContacts) {
        if (contact.email && !validateEmail(contact.email)) {
          alert('Please enter valid email addresses for all emergency contacts');
          return;
        }
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .upsert(
          emergencyContacts.map(contact => ({
            user_id: user?.id,
            ...contact
          }))
        );

      if (error) throw error;
      alert('Emergency contacts saved successfully!');
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      alert('Failed to save emergency contacts. Please try again.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profile</h1>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-8 border-blue-400 p-6">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Personal Info Group */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={profile.full_name}
                onChange={e => handleChange("full_name", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Address 1"
                value={profile.address1}
                onChange={e => handleChange("address1", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Address 2"
                value={profile.address2}
                onChange={e => handleChange("address2", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Address 3"
                value={profile.address3}
                onChange={e => handleChange("address3", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Country"
                value={profile.country}
                onChange={e => handleChange("country", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={profile.postal_code}
                onChange={e => handleChange("postal_code", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Emergency Contact 1 Group */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact 1</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={profile.emergency_contact1_name}
                onChange={e => handleChange("emergency_contact1_name", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Mobile # eg: 0123456789"
                value={profile.emergency_contact1_phone}
                onChange={e => handleChange("emergency_contact1_phone", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^0\d{9}$|^0\d{1} \d{9}$|^0\d{1} \d{8}$"
                inputMode="tel"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.emergency_contact1_email || ''}
                onChange={e => handleChange("emergency_contact1_email", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              />
            </div>

            {/* Emergency Contact 2 Group */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact 2</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={profile.emergency_contact2_name}
                onChange={e => handleChange("emergency_contact2_name", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Mobile # eg: 0123456789"
                value={profile.emergency_contact2_phone}
                onChange={e => handleChange("emergency_contact2_phone", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^0\d{9}$|^0\d{1} \d{9}$|^0\d{1} \d{8}$"
                inputMode="tel"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.emergency_contact2_email || ''}
                onChange={e => handleChange("emergency_contact2_email", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              />
            </div>

            {/* Emergency Contact 3 Group */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact 3</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={profile.emergency_contact3_name}
                onChange={e => handleChange("emergency_contact3_name", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Mobile # eg: 0123456789"
                value={profile.emergency_contact3_phone}
                onChange={e => handleChange("emergency_contact3_phone", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^0\d{9}$|^0\d{1} \d{9}$|^0\d{1} \d{8}$"
                inputMode="tel"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.emergency_contact3_email || ''}
                onChange={e => handleChange("emergency_contact3_email", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              />
            </div>

            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relevant Medical History</h3>
              <textarea
                placeholder="Please be brief...."
                value={profile.medical_history || ''}
                onChange={e => handleChange("medical_history", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={500}
                style={{ height: '14em', resize: 'none' }}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Characters remaining: {500 - (profile.medical_history?.length || 0)}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Medications</h3>
              <textarea
                placeholder="Please be brief...."
                value={profile.medications || ''}
                onChange={e => handleChange("medications", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={500}
                style={{ height: '14em', resize: 'none' }}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Characters remaining: {500 - (profile.medications?.length || 0)}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-200 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Special Notes</h3>
              <textarea
                placeholder="Please be brief...."
                value={profile.special_notes || ''}
                onChange={e => handleChange("special_notes", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={500}
                style={{ height: '14em', resize: 'none' }}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Characters remaining: {500 - (profile.special_notes?.length || 0)}</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {saved && (
              <div className="text-green-600 dark:text-green-400 text-center mt-2">Profile saved!</div>
            )}
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowAlarm(true)}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Test Alarm
          </button>
        </div>

        {showAlarm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center border-t-8 border-red-400">
              <h3 className="text-xl font-bold text-red-600 mb-4">ALARM TEST ONLY</h3>
              <p className="mb-2 text-gray-900 dark:text-gray-100">Heart Rate: &lt;30</p>
              <p className="mb-2 text-gray-900 dark:text-gray-100">SPO2: &lt;80%</p>
              <p className="mb-4 text-gray-900 dark:text-gray-100">Movement: 0</p>
              <button
                onClick={() => setShowAlarm(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}