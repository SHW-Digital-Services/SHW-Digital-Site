import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Settings } from "lucide-react";
import CookieConsent from "./CookieConsent";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://shwdigitalservices.site"),
  title: "SHW Digital Services",
  description: "Transform. Automate. Grow.",
  icons: {
    icon: "/logo/logo.ico",
    shortcut: "/logo/logo.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
        <Link
          href="/legal"
          aria-label="Legal information"
          title="Legal information"
          style={{
            alignItems: "center",
            background: "rgba(26, 16, 56, 0.88)",
            border: "1px solid rgba(192, 132, 252, 0.55)",
            borderRadius: 999,
            bottom: 20,
            boxShadow: "0 0 22px rgba(139, 92, 246, 0.35)",
            color: "#E9D5FF",
            display: "flex",
            gap: 7,
            left: 20,
            padding: "9px 13px 9px 10px",
            position: "fixed",
            textDecoration: "none",
            zIndex: 200,
          }}
        >
          <Scale size={17} strokeWidth={1.8} aria-hidden="true" />
          <span style={{ fontSize: 12, letterSpacing: "0.08em" }}>LEGAL</span>
        </Link>
        <Link
          href="/admin"
          aria-label="Admin dashboard"
          title="Admin dashboard"
          style={{
            alignItems: "center",
            aspectRatio: "1",
            background: "rgba(26, 16, 56, 0.9)",
            border: "1px solid rgba(192, 132, 252, 0.5)",
            borderRadius: 999,
            bottom: 20,
            boxShadow: "0 0 22px rgba(139, 92, 246, 0.35)",
            color: "#D8B4FE",
            display: "flex",
            justifyContent: "center",
            position: "fixed",
            right: 20,
            textDecoration: "none",
            width: 38,
            zIndex: 301,
          }}
        >
          <Settings size={17} strokeWidth={1.9} aria-hidden="true" />
        </Link>
      </body>
    </html>
  );
}


