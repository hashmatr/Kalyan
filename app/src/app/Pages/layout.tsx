import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Kalyan | Beast Mode Progress Tracker",
  description: "Transform your life with disciplined daily habits. Track your progress, unlock rewards, and become the best version of yourself.",
  keywords: ["progress tracker", "habit tracker", "self improvement", "discipline", "productivity"],
  authors: [{ name: "Kalyan" }],
  openGraph: {
    title: "Kalyan | Beast Mode Progress Tracker",
    description: "Transform your life with disciplined daily habits.",
    type: "website",
  },
};

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} antialiased animated-bg grid-pattern min-h-screen`}>
      {children}
    </div>
  );
}
