"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import AnimatedSection from "./AnimatedSection";
import { useDictionary } from "@/i18n/DictionaryContext";

function ExpertiseCard({
  item,
  index,
}: {
  item: { number: string; title: string; description: string; tags: string[] };
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group relative border border-[var(--border)] p-8 md:p-10 hover:border-[var(--accent-dim)] transition-all duration-500 bg-[var(--surface)]/50 hover:bg-[var(--surface)]"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--accent)]/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <span className="font-[family-name:var(--font-syne)] text-sm font-600 text-[var(--accent)]">
            {item.number}
          </span>
          <svg
            className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </div>

        <h3 className="font-[family-name:var(--font-syne)] text-xl md:text-2xl font-600 mb-4 tracking-tight">
          {item.title}
        </h3>

        <p className="text-[var(--muted)] text-sm md:text-base leading-relaxed mb-8 font-light">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border border-[var(--border)] text-[var(--muted)] group-hover:border-[var(--accent-dim)]/30 group-hover:text-[var(--foreground)] transition-all duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Expertise() {
  const { t } = useDictionary();

  return (
    <section id="expertise" className="relative pt-24 pb-32 md:pt-32 md:pb-40 scroll-mt-16 md:scroll-mt-20">
      {/* Divider */}
      <div className="gradient-line mb-16 md:mb-20" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 mb-16 md:mb-24">
          <AnimatedSection className="md:col-span-3">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">
              {t.expertise.label}
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="md:col-span-9">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-700 leading-tight tracking-tight">
              {t.expertise.heading}
              <br />
              {t.expertise.headingLine2}
            </h2>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.expertise.items.map((item, i) => (
            <ExpertiseCard key={item.number} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
