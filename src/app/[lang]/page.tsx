import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import { organizationJsonLd } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/sections/Hero";
import Ratio from "@/components/sections/Ratio";
import Services from "@/components/sections/Services";
import UseCases from "@/components/sections/UseCases";
import Process from "@/components/sections/Process";
import Deployment from "@/components/sections/Deployment";
import Control from "@/components/sections/Control";
import CaseStudy from "@/components/sections/CaseStudy";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const other: Locale = lang === "cs" ? "en" : "cs";
  const homeHref = localePath(lang);
  const switchHref = `${localePath(other)}?lang=${other}`;
  const contactHref = `#${t.contact.id}`;

  return (
    <>
      <a className="skip-link" href="#main">
        {t.skipLink}
      </a>
      <SiteHeader
        nav={t.nav}
        langSwitch={t.langSwitch}
        homeHref={homeHref}
        ctaHref={contactHref}
        switchHref={switchHref}
        switchLang={other}
      />
      <main id="main">
        <Hero t={t} ctaHref={contactHref} processHref={`#${t.process.id}`} />
        <Ratio t={t.ratio} />
        <Services t={t.services} />
        <UseCases t={t.useCases} contactHref={contactHref} />
        <Process t={t.process} />
        <Deployment t={t.deployment} />
        <Control t={t.control} />
        <CaseStudy t={t.case} />
        <Faq t={t.faq} />
        <Contact t={t.contact} />
      </main>
      <SiteFooter t={t} homeHref={homeHref} switchHref={switchHref} switchLang={other} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(lang)) }}
      />
    </>
  );
}
