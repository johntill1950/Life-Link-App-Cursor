"use client";
import { ReactNode, useEffect } from "react";
import { ThemeEffect } from "./ThemeEffect";
import { Layout } from "./layout/Layout";

export function ClientRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkMode = localStorage.getItem('dark_mode');
      if (darkMode === 'true') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);
  return (
    <>
      <ThemeEffect />
      <Layout>{children}</Layout>
    </>
  );
} 