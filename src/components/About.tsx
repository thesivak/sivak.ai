"use client";

import AnimatedSection from "./AnimatedSection";

export default function About() {
  return (
    <section id="about" className="relative py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          {/* Label */}
          <AnimatedSection className="md:col-span-3">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">
              About
            </span>
          </AnimatedSection>

          {/* Content */}
          <div className="md:col-span-9">
            <AnimatedSection delay={0.1}>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-700 leading-tight tracking-tight mb-8">
                Engineering the future at the
                <br />
                <span className="text-gradient">intersection of AI & code</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <p className="text-[var(--muted)] leading-relaxed text-base md:text-lg font-light">
                  With over a decade in software engineering, I&apos;ve built
                  everything from high-performance frontend applications to
                  full-stack platforms. My work spans from crafting pixel-perfect
                  interfaces with Vue.js, Nuxt, and React to designing complex
                  system architectures.
                </p>
                <p className="text-[var(--muted)] leading-relaxed text-base md:text-lg font-light">
                  Over the past five years, I&apos;ve pivoted toward AI — designing
                  and deploying autonomous agent systems, building AI-powered
                  workflows, and helping companies integrate intelligent automation
                  into their operations. I founded{" "}
                  <span className="text-[var(--foreground)]">agentuj.cz</span> to
                  help Czech businesses harness AI agents at scale.
                </p>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection delay={0.3}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-[var(--border)]">
                {[
                  { value: "18", label: "Years Experience" },
                  { value: "AI", label: "Architecture" },
                  { value: "CZ/EN", label: "Bilingual" },
                  { value: "3", label: "Companies Founded" },
                ].map((stat) => (
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
