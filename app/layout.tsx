import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "রাজশাহী ইফতার ম্যাপ",
  description: "রাজশাহীতে বিনামূল্যে ইফতারের স্থান খুঁজুন",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" data-theme="ramadan" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
