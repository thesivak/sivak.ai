import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Script from "next/script";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = rawLang as Locale;
  const t = await getDictionary(lang);
  const baseUrl = "https://www.sivak.ai";

  return {
    title: t.metadata.title,
    description: t.metadata.description,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      url: lang === "en" ? baseUrl : `${baseUrl}/cs`,
      type: "website",
    },
    alternates: {
      languages: {
        en: baseUrl,
        cs: `${baseUrl}/cs`,
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Locale;

  return (
    <html lang={lang}>
      <body className={`${dmSans.variable} ${syne.variable} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S98V3B32ZL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S98V3B32ZL');
          `}
        </Script>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
