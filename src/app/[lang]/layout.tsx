import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, Jost } from "next/font/google";
import Script from "next/script";
import { isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#0B1220",
  viewportFit: "cover",
};

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
  // Rendered from design/og/og-<lang>.html
  const image = { url: `/og/${lang}.png`, width: 1200, height: 630, alt: t.metadata.title };

  return {
    metadataBase: new URL(SITE_URL),
    title: t.metadata.title,
    description: t.metadata.description,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      url: localePath(lang),
      siteName: "sivak.ai",
      locale: lang === "cs" ? "cs_CZ" : "en_US",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t.metadata.title,
      description: t.metadata.description,
      images: [image.url],
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
    <html lang={lang} className={`${jost.variable} ${plexMono.variable}`}>
      <body>
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
