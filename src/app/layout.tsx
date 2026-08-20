import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "QuantumStore — Future-grade gear",
  description: "A demo store for the Kane CLI hackathon. Built with an AI agent, verified with Kane.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-arcade-cream text-ink-black font-arcade">
        {children}
      </body>
    </html>
  );
}
