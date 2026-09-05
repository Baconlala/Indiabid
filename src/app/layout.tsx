import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AgeGateProvider } from "@/lib/age-gate-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Required so relative OG image URLs (e.g. /api/og?...) resolve to an
  // absolute URL — without this, social crawlers may fail to fetch them.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "IndiaBid — Made in India, For India",
  description:
    "The pay-to-rank public leaderboard for India. Add a listing for free, claim your rank by outbidding the competition.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AgeGateProvider>{children}</AgeGateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
