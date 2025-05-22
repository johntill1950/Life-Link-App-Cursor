import "./globals.css";
import { Inter } from "next/font/google";
import { Layout } from "../components/layout/Layout";
import { SupabaseProvider } from "../components/SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <Layout>{children}</Layout>
        </SupabaseProvider>
      </body>
    </html>
  );
}
