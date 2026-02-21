import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: "রাজশাহী ইফতার ম্যাপ",
  description: "রাজশাহীতে বিনামূল্যে ইফতারের স্থান খুঁজুন",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" data-theme="ramadan" className={hindSiliguri.variable} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
