import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mirek Sivák — AI Architect & Senior Engineer",
  description:
    "Senior Software Engineer and AI Architect with 18 years of experience building scalable applications and autonomous AI systems.",
  openGraph: {
    title: "Mirek Sivák — AI Architect & Senior Engineer",
    description:
      "Senior Software Engineer and AI Architect with 18 years of experience building scalable applications and autonomous AI systems.",
    url: "https://www.sivak.ai",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${syne.variable} antialiased`}>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
