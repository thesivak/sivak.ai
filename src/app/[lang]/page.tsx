import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/dictionaries";
import Logo, { LogoMark } from "@/components/Logo";

const EMAIL = "mirek@sivak.ai";
const PHONE = "+420 730 515 615";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(t.contact.mailSubject)}`;
  const tel = `tel:${PHONE.replaceAll(" ", "")}`;

  return (
    <main className="mx-auto max-w-6xl px-6 md:px-12">
      {/* The business card */}
      <section className="flex min-h-svh flex-col py-8 md:py-12">
        <div className="flex justify-end">
          <a
            href={localePath(lang === "cs" ? "en" : "cs")}
            hrefLang={lang === "cs" ? "en" : "cs"}
            className="text-sm text-muted transition-colors hover:text-paper"
          >
            {t.langSwitch}
          </a>
        </div>

        <div className="flex flex-1 flex-col justify-center py-16">
          <h1 className="rise">
            <Logo className="h-auto w-full max-w-[760px]" />
          </h1>
          <p
            className="rise mt-10 text-2xl font-light md:mt-14 md:text-4xl"
            style={{ animationDelay: "120ms" }}
          >
            {t.hero.tagline}
          </p>
          <p
            className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "200ms" }}
          >
            {t.hero.lead}
          </p>
          <div
            className="rise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "280ms" }}
          >
            <a
              href={mailto}
              className="rounded-full bg-paper px-6 py-3 font-medium text-ink transition-opacity hover:opacity-85"
            >
              {t.hero.cta}
            </a>
            <a
              href="/mirek-sivak.vcf"
              download
              className="rounded-full border border-line px-6 py-3 transition-colors hover:border-paper/40"
            >
              {t.hero.saveContact}
            </a>
          </div>
        </div>

        <ContactRow t={t} tel={tel} />
      </section>

      <Section label={t.services.label}>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-12">
          {t.services.items.map((item, i) => (
            <li key={item.title}>
              <span className="text-sm text-muted tabular-nums">0{i + 1}</span>
              <h3 className="mt-3 text-xl font-medium">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section label={t.approach.label}>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-12">
          {t.approach.items.map((item) => (
            <li key={item.title}>
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-16 max-w-3xl border-l border-paper/30 pl-6 text-lg leading-relaxed font-light">
          {t.approach.case}
        </p>
      </Section>

      <section className="relative overflow-hidden border-t border-line py-24 md:py-32">
        <LogoMark className="pointer-events-none absolute -right-10 top-1/2 hidden h-[420px] -translate-y-1/2 text-paper/[0.04] md:block" />
        <h2 className="relative max-w-2xl text-4xl leading-tight font-light md:text-6xl">
          {t.contact.heading}
        </h2>
        <p className="relative mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {t.contact.text}
        </p>
        <a
          href={mailto}
          className="relative mt-10 inline-block rounded-full bg-paper px-6 py-3 font-medium text-ink transition-opacity hover:opacity-85"
        >
          {t.hero.cta}
        </a>
      </section>

      <footer className="border-t border-line py-10">
        <ContactRow t={t} tel={tel} />
        <p className="mt-10 text-sm text-muted">
          © {new Date().getFullYear()} {t.footer}
        </p>
      </footer>
    </main>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-20 md:py-28">
      <h2 className="mb-12 text-sm tracking-[0.2em] text-muted uppercase">{label}</h2>
      {children}
    </section>
  );
}

function ContactRow({
  t,
  tel,
}: {
  t: Awaited<ReturnType<typeof getDictionary>>;
  tel: string;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-2xl font-semibold md:text-3xl">{t.person.name}</p>
        <p className="mt-1 text-muted md:text-lg">{t.person.role}</p>
      </div>
      <div className="flex flex-col gap-1 text-lg sm:items-end md:text-2xl">
        <a href={`mailto:${EMAIL}`} className="hover:text-muted">
          {EMAIL}
        </a>
        <a href={tel} className="tabular-nums hover:text-muted">
          {PHONE}
        </a>
      </div>
    </div>
  );
}
