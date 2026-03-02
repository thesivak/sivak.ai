import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import { DictionaryProvider } from "@/i18n/DictionaryContext";
import HomeContent from "@/components/HomeContent";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Locale;
  const dictionary = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dictionary} lang={lang}>
      <HomeContent />
    </DictionaryProvider>
  );
}
