"use client";

import AnimatedSection from "./AnimatedSection";

export default function Contact() {
  return (
    <section id="contact" className="relative pt-24 pb-32 md:pt-32 md:pb-40 scroll-mt-16 md:scroll-mt-20">
      <div className="gradient-line mb-16 md:mb-20" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          <AnimatedSection className="md:col-span-3">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">
              Contact
            </span>
          </AnimatedSection>

          <div className="md:col-span-9">
            <AnimatedSection delay={0.1}>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-700 leading-tight tracking-tight mb-6">
                Let&apos;s build something
                <br />
                <span className="text-gradient">extraordinary</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-[var(--muted)] text-base md:text-lg leading-relaxed font-light max-w-xl mb-12">
                Whether you need an AI strategy, a scalable frontend, or an
                autonomous agent system — I&apos;d love to hear about your
                project.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <a
                  href="mailto:mirek@sivak.ai"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-[var(--background)] font-[family-name:var(--font-syne)] font-600 text-sm tracking-[0.1em] uppercase hover:bg-[var(--foreground)] transition-colors duration-300"
                >
                  mirek@sivak.ai
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="flex flex-wrap gap-8 pt-10 border-t border-[var(--border)]">
                <a
                  href="https://www.linkedin.com/in/mireksivak/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300 tracking-wide"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/thesivak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300 tracking-wide"
                >
                  GitHub
                </a>
                <a
                  href="https://agentuj.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-300 tracking-wide"
                >
                  agentuj.cz
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
