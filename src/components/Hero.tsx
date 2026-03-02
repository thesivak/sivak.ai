"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useDictionary } from "@/i18n/DictionaryContext";

export default function Hero() {
  const { t } = useDictionary();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : false}
          transition={{ duration: 0.5, delay: 0 }}
          className="mb-8 md:mb-12"
          style={ready ? undefined : { opacity: 0 }}
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.hero.available}
          </span>
        </motion.div>

        {/* Name */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "110%" }}
            animate={ready ? { y: 0 } : false}
            transition={{ duration: 0.9, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-syne)] text-[clamp(4rem,14vw,12rem)] font-800 leading-[0.9] tracking-tight will-change-transform"
            style={{ transform: "translateY(110%)" }}
          >
            {t.hero.firstName}
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "110%" }}
            animate={ready ? { y: 0 } : false}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-syne)] text-[clamp(4rem,14vw,12rem)] font-800 leading-[0.9] tracking-tight will-change-transform"
            style={{ transform: "translateY(110%)" }}
          >
            {t.hero.lastName}<span className="text-[var(--accent)]">.</span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          style={ready ? undefined : { opacity: 0 }}
        >
          <div className="max-w-xl">
            <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed font-light">
              <span className="text-[var(--foreground)] font-medium">
                {t.hero.subtitle}
              </span>{" "}
              — {t.hero.description}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : false}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex gap-6 items-center"
            style={ready ? undefined : { opacity: 0 }}
          >
            <a
              href="#about"
              className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
            >
              {t.hero.explore}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-y-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 gradient-line" />
    </section>
  );
}
