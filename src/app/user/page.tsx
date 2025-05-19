"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface UserDetails {
  id: string;
  full_name: string;
  username: string;
  email: string;
}

export default function UserPage() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrCreateUser = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      // Try to fetch user details
      const { data, error } = await supabase
        .from("user_details")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setUserDetails(data);
        setLoading(false);
      } else {
        // If not found, create a new row
        const { data: newData, error: insertError } = await supabase
          .from("user_details")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            username: user.user_metadata?.username || "",
            email: user.email || ""
          })
          .select()
          .single();
        if (insertError) {
          setError("Failed to create user profile");
        } else {
          setUserDetails(newData);
        }
        setLoading(false);
      }
    };
    fetchOrCreateUser();
  }, []);

  const handleChange = (field: keyof UserDetails, value: string) => {
    if (!userDetails) return;
    setUserDetails({ ...userDetails, [field]: value });
  };

  const handleSave = async () => {
    if (!userDetails) return;
    setSaving(true);
    setError(null);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("user_details")
      .update({
        full_name: userDetails.full_name,
        username: userDetails.username,
        email: userDetails.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userDetails.id);
    if (error) setError("Failed to save changes");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!userDetails) return null;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={userDetails.full_name}
            onChange={e => handleChange("full_name", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={userDetails.username}
            onChange={e => handleChange("username", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={userDetails.email}
            onChange={e => handleChange("email", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
} 