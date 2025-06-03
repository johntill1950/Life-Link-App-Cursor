"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { signOut } from "@/lib/userService";

interface UserInfo {
  full_name?: string;
  email?: string;
  role?: string;
}

export default function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      const { data: { user: userObj } } = await supabase.auth.getUser();
      if (userObj) {
        let role = userObj.user_metadata?.role;
        let full_name = userObj.user_metadata?.full_name;
        if (!role || !full_name) {
          const { data: profileData } = await supabase
            .from("profile")
            .select("is_admin")
            .eq("id", userObj.id)
            .single();
          if (profileData) {
            full_name = userObj.user_metadata?.full_name || full_name;
            role = profileData.is_admin ? "admin" : role;
          }
        }
        if (mounted) {
          setUser({
            full_name: full_name || userObj.email,
            email: userObj.email,
            role: role,
          });
        }
      } else {
        if (mounted) setUser(null);
      }
      if (mounted) setLoading(false);
    };

    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    window.location.reload();
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
          <>
            <div className="flex flex-col items-end">
              <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
              {user.role && (
                <span className="text-xs text-blue-600 dark:text-blue-400">{user.role}</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-gray-500">Not logged in</span>
        )}
      </div>
    </header>
  );
} 