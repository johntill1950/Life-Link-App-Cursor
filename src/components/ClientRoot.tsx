"use client";
import { ReactNode } from "react";
import { ThemeEffect } from "./ThemeEffect";
import { Layout } from "./layout/Layout";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeEffect />
      <Layout>{children}</Layout>
    </>
  );
} 