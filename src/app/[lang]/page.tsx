import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import BusinessCard from "@/components/BusinessCard";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const other = lang === "cs" ? "en" : "cs";

  return (
    <>
      <a className="lang-switch" href={localePath(other)} hrefLang={other}>
        {t.langSwitch}
      </a>
      <main>
        <BusinessCard t={t} />
      </main>
      <footer>
        © {new Date().getFullYear()} {t.footer}
      </footer>
    </>
  );
}
