"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { fetchUserProfile, upsertUserProfile } from "@/lib/userService";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { useRouter } from "next/navigation";

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
};

type ProfileType = typeof initialProfile;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileType>({ ...initialProfile });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login');
      return;
    }
    if (!user) return;
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile(user.id);
        const sanitized: ProfileType = { ...initialProfile, ...data };
        setProfile(sanitized);
      } catch (err: any) {
        setError("Failed to load profile");
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [user, userLoading]);

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
    try {
      await upsertUserProfile(user.id, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError("Please check all details and save again");
    }
    setSaving(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Profile Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Personal Info Group */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={profile.full_name}
                onChange={e => handleChange("full_name", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="text"
                placeholder="Address 1"
                value={profile.address1}
                onChange={e => handleChange("address1", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="text"
                placeholder="Address 2"
                value={profile.address2}
                onChange={e => handleChange("address2", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="text"
                placeholder="Address 3"
                value={profile.address3}
                onChange={e => handleChange("address3", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="text"
                placeholder="Country"
                value={profile.country}
                onChange={e => handleChange("country", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={profile.postal_code}
                onChange={e => handleChange("postal_code", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>

            {/* Emergency Contact 1 Group */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Emergency Contact 1 Name"
                value={profile.emergency_contact1_name}
                onChange={e => handleChange("emergency_contact1_name", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="tel"
                placeholder="Emergency Contact 1 Mobile # (e.g. +61 412345678)"
                value={profile.emergency_contact1_phone}
                onChange={e => handleChange("emergency_contact1_phone", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400"
                pattern="^\\+\\d{1,3} ?\\d{4,14}$"
                inputMode="tel"
              />
            </div>

            {/* Emergency Contact 2 Group */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Emergency Contact 2 Name"
                value={profile.emergency_contact2_name}
                onChange={e => handleChange("emergency_contact2_name", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="tel"
                placeholder="Emergency Contact 2 Mobile # (e.g. +61 412345678)"
                value={profile.emergency_contact2_phone}
                onChange={e => handleChange("emergency_contact2_phone", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400"
                pattern="^\\+\\d{1,3} ?\\d{4,14}$"
                inputMode="tel"
              />
            </div>

            {/* Emergency Contact 3 Group */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Emergency Contact 3 Name"
                value={profile.emergency_contact3_name}
                onChange={e => handleChange("emergency_contact3_name", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 mb-2"
              />
              <input
                type="tel"
                placeholder="Emergency Contact 3 Mobile # (e.g. +61 412345678)"
                value={profile.emergency_contact3_phone}
                onChange={e => handleChange("emergency_contact3_phone", e.target.value)}
                className="w-full p-2 border rounded dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400"
                pattern="^\\+\\d{1,3} ?\\d{4,14}$"
                inputMode="tel"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {saved && (
              <div className="text-green-600 text-center mt-2">Profile saved!</div>
            )}
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowAlarm(true)}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Test Alarm
          </button>
        </div>

        {showAlarm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-bold text-red-600 mb-4">ALARM TEST ONLY</h3>
              <p className="mb-2 dark:text-gray-100">Heart Rate: &lt;30</p>
              <p className="mb-2 dark:text-gray-100">SPO2: &lt;80%</p>
              <p className="mb-4 dark:text-gray-100">Movement: 0</p>
              <button
                onClick={() => setShowAlarm(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <DocumentUploadSection />
      </div>
    </div>
  );
}