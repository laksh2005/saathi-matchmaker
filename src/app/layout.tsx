import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saathi | Matchmaker Dashboard",
  description: "Internal matchmaking workspace for The Date Crew matchmakers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
