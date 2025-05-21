"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

interface UserInfo {
  full_name?: string;
  username?: string;
  email?: string;
  role?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        // Try to get role from user_metadata or profiles table
        let role = user.user_metadata?.role;
        let full_name = user.user_metadata?.full_name;
        let username = user.user_metadata?.username;
        if (!role || !full_name) {
          // Try to fetch from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username, is_admin")
            .eq("id", user.id)
            .single();
          if (profile) {
            full_name = profile.full_name || full_name;
            username = profile.username || username;
            role = profile.is_admin ? "admin" : role;
          }
        }
        setUser({
          full_name: full_name || username || user.email,
          username: username,
          email: user.email,
          role: role,
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="" width={48} height={48} />
        <span className="font-bold text-xl text-red-600">Life-Link.app</span>
      </div>
      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-gray-500">Loading...</span>
        ) : user ? (
          <div className="flex flex-col items-end">
            <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
            {user.role && (
              <span className="text-xs text-blue-600 dark:text-blue-400">{user.role}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">Not logged in</span>
        )}
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
} 