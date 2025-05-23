"use client";
import { useEffect } from "react";
import { useUserSettings } from "@/lib/useUserSettings";

export function ThemeEffect() {
  const { settings } = useUserSettings();
  useEffect(() => {
    if (settings && typeof settings.dark_mode_enabled === 'boolean') {
      if (settings.dark_mode_enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings?.dark_mode_enabled]);
  return null;
} 