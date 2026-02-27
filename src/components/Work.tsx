"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import AnimatedSection from "./AnimatedSection";

const roles = [
  {
    company: "agentuj.cz",
    role: "Founder",
    period: "2026 — Present",
    description:
      "Helping Czech companies deploy and manage AI agents. From workflow analysis to fully autonomous agent systems that eliminate repetitive work.",
    type: "AI Consulting",
  },
  {
    company: "Zapfloor",
    role: "Senior Frontend Engineer & AI Engineer",
    period: "2024 — Present",
    description:
      "Building workspace management applications with Vue.js and Nuxt. Integrating AI capabilities into the platform for intelligent workspace automation.",
    type: "Product",
  },
  {
    company: "TheSivak s.r.o.",
    role: "Founder",
    period: "2019 — Present",
    description:
      "Full-stack development consultancy delivering scalable applications, CRM automation, and custom integrations for businesses across Europe.",
    type: "Consultancy",
  },
  {
    company: "Phrase (Memsource)",
    role: "Frontend Engineer",
    period: "Previous",
    description:
      "Worked on the localization platform used by global enterprises. Built complex UI components for translation management workflows.",
    type: "Enterprise SaaS",
  },
];

function WorkItem({
  item,
  index,
}: {
  item: (typeof roles)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 border-b border-[var(--border)] hover:border-[var(--accent-dim)] transition-colors duration-500"
    >
      <div className="md:col-span-3 flex items-start justify-between md:block">
        <div>
          <h3 className="font-[family-name:var(--font-syne)] text-xl md:text-2xl font-600 tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
            {item.company}
          </h3>
          <span className="text-xs tracking-[0.15em] uppercase text-[var(--muted)] mt-1 block">
            {item.period}
          </span>
        </div>
        <span className="md:hidden text-[10px] tracking-[0.15em] uppercase text-[var(--accent)] border border-[var(--accent-dim)]/30 px-2 py-1">
          {item.type}
        </span>
      </div>

      <div className="md:col-span-6">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">
          {item.role}
        </p>
        <p className="text-[var(--muted)] text-sm leading-relaxed font-light">
          {item.description}
        </p>
      </div>

      <div className="hidden md:flex md:col-span-3 items-start justify-end">
        <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--accent)] border border-[var(--accent-dim)]/30 px-3 py-1.5">
          {item.type}
        </span>
      </div>
    </motion.div>
  );
}

export default function Work() {
  return (
    <section id="work" className="relative pt-24 pb-32 md:pt-32 md:pb-40 scroll-mt-16 md:scroll-mt-20">
      <div className="gradient-line mb-16 md:mb-20" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 mb-16 md:mb-24">
          <AnimatedSection className="md:col-span-3">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">
              Work
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="md:col-span-9">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-700 leading-tight tracking-tight">
              Selected experience
            </h2>
          </AnimatedSection>
        </div>

        <div>
          {roles.map((item, i) => (
            <WorkItem key={item.company} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
