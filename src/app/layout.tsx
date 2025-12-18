import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Auth0ProviderWrapper from "@/components/Auth0ProviderWrapper";
import { getSiteSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tree Market - Buy & Sell Ex-Ground Trees",
  description:
    "Connect with landscape architects, developers, and tree enthusiasts. List and find quality ex-ground trees for your next project.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings().catch(() => null);
  const logoUrl = settings?.logoUrl || undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Auth0ProviderWrapper>
          <Header logoUrl={logoUrl} />
          <main>{children}</main>
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
