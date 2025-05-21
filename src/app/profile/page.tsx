"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

const initialProfile = {
  full_name: "",
  username: "",
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

export default function ProfilePage() {
  const [profile, setProfile] = useState({ ...initialProfile });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile({ ...initialProfile, ...data });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not logged in");
      setSaving(false);
      return;
    }
    // Upsert profile (insert or update)
    const { error } = await supabase
      .from("profile")
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      if (error.message && error.message.toLowerCase().includes("duplicate key value violates unique constraint") && error.message.toLowerCase().includes("username")) {
        setError("Username already taken. Please choose another.");
      } else {
        setError("Please check all details and save again");
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={profile.full_name}
          onChange={e => handleChange("full_name", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={profile.username}
          onChange={e => handleChange("username", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address 1"
          value={profile.address1}
          onChange={e => handleChange("address1", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address 2"
          value={profile.address2}
          onChange={e => handleChange("address2", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address 3"
          value={profile.address3}
          onChange={e => handleChange("address3", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Country"
          value={profile.country}
          onChange={e => handleChange("country", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={profile.postal_code}
          onChange={e => handleChange("postal_code", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Emergency Contact 1 Name"
          value={profile.emergency_contact1_name}
          onChange={e => handleChange("emergency_contact1_name", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          placeholder="Emergency Contact 1 Mobile # (e.g. +61 412345678)"
          value={profile.emergency_contact1_phone}
          onChange={e => handleChange("emergency_contact1_phone", e.target.value)}
          className="w-full p-2 border rounded"
          pattern="^\+\d{1,3} ?\d{4,14}$"
          inputMode="tel"
        />
        <input
          type="text"
          placeholder="Emergency Contact 2 Name"
          value={profile.emergency_contact2_name}
          onChange={e => handleChange("emergency_contact2_name", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          placeholder="Emergency Contact 2 Mobile # (e.g. +61 412345678)"
          value={profile.emergency_contact2_phone}
          onChange={e => handleChange("emergency_contact2_phone", e.target.value)}
          className="w-full p-2 border rounded"
          pattern="^\+\d{1,3} ?\d{4,14}$"
          inputMode="tel"
        />
        <input
          type="text"
          placeholder="Emergency Contact 3 Name"
          value={profile.emergency_contact3_name}
          onChange={e => handleChange("emergency_contact3_name", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          placeholder="Emergency Contact 3 Mobile # (e.g. +61 412345678)"
          value={profile.emergency_contact3_phone}
          onChange={e => handleChange("emergency_contact3_phone", e.target.value)}
          className="w-full p-2 border rounded"
          pattern="^\+\d{1,3} ?\d{4,14}$"
          inputMode="tel"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && (
          <div className="text-green-600 text-center mt-2">Profile saved!</div>
        )}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowAlarm(true)}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Test Alarm
        </button>
      </div>
      {showAlarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">ALARM TEST ONLY</h3>
            <p className="mb-2">Heart Rate: &lt;30</p>
            <p className="mb-2">SPO2: &lt;80%</p>
            <p className="mb-4">Movement: 0</p>
            <button
              onClick={() => setShowAlarm(false)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
