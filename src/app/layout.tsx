import "./globals.css";
import { Inter } from "next/font/google";
import { SupabaseProvider } from "../components/SupabaseProvider";
import { ReactNode } from "react";
import { ClientRoot } from "../components/ClientRoot";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-blue-50 min-h-screen"}>
        <SupabaseProvider>
          <ClientRoot>{children}</ClientRoot>
        </SupabaseProvider>
      </body>
    </html>
  );
}
