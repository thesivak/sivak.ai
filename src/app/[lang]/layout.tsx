import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Jost } from "next/font/google";
import Script from "next/script";
import { isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import "../globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
});

const baseUrl = "https://www.sivak.ai";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return {
    metadataBase: new URL(baseUrl),
    title: t.metadata.title,
    description: t.metadata.description,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      url: localePath(lang),
      siteName: "sivak.ai",
      locale: lang === "cs" ? "cs_CZ" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: localePath(lang),
      languages: { cs: "/", en: "/en", "x-default": "/" },
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
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <body className={`${jost.variable} antialiased`}>
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
        {children}
      </body>
    </html>
  );
}
