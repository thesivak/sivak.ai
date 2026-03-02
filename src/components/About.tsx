"use client";

import AnimatedSection from "./AnimatedSection";
import { useDictionary } from "@/i18n/DictionaryContext";

export default function About() {
  const { t } = useDictionary();

  const stats = [
    { value: t.about.stat1Value, label: t.about.stat1Label },
    { value: t.about.stat2Value, label: t.about.stat2Label },
    { value: t.about.stat3Value, label: t.about.stat3Label },
    { value: t.about.stat4Value, label: t.about.stat4Label },
  ];

  return (
    <section id="about" className="relative pt-24 pb-32 md:pt-32 md:pb-40 scroll-mt-16 md:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          {/* Label */}
          <AnimatedSection className="md:col-span-3">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">
              {t.about.label}
            </span>
          </AnimatedSection>

          {/* Content */}
          <div className="md:col-span-9">
            <AnimatedSection delay={0.1}>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-700 leading-tight tracking-tight mb-8">
                {t.about.heading}
                <br />
                <span className="text-gradient">{t.about.headingHighlight}</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <p className="text-[var(--muted)] leading-relaxed text-base md:text-lg font-light">
                  {t.about.paragraph1}
                </p>
                <p className="text-[var(--muted)] leading-relaxed text-base md:text-lg font-light">
                  {t.about.paragraph2Start}{" "}
                  <span className="text-[var(--foreground)]">{t.about.paragraph2Link}</span>{" "}
                  {t.about.paragraph2End}
                </p>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection delay={0.3}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-[var(--border)]">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-700 text-[var(--accent)] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xs tracking-[0.15em] uppercase text-[var(--muted)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
