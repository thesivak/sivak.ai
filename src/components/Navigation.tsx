"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDictionary } from "@/i18n/DictionaryContext";

const NAV_HEIGHT = 80;
const SCROLL_PADDING = 32;

export default function Navigation() {
  const { t, lang } = useDictionary();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.expertise, href: "#expertise" },
    { label: t.nav.work, href: "#work" },
    { label: t.nav.contact, href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.replace("#", "");
      const section = document.getElementById(id);
      if (!section) return;

      const label = section.querySelector("span, h2, h3");
      const target = label || section;

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY;
      const scrollTo = targetTop - NAV_HEIGHT - SCROLL_PADDING;

      window.scrollTo({ top: scrollTo, behavior: "smooth" });
      setMobileOpen(false);
    },
    []
  );

  const toggleLang = lang === "en" ? "cs" : "en";
  const toggleHref = lang === "en" ? "/cs" : "/";
  const toggleLabel = lang === "en" ? "CZ" : "EN";

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0C0C0C]/80 backdrop-blur-xl border-b border-[#2A2A2A]/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <a
            href={lang === "en" ? "/" : "/cs"}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-[family-name:var(--font-syne)] font-bold text-xl tracking-tight"
          >
            sivak<span className="text-[var(--accent)]">.ai</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300 tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:mirek@sivak.ai"
              className="text-sm px-5 py-2 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all duration-300 tracking-wide uppercase"
            >
              {t.nav.getInTouch}
            </a>
            <a
              href={toggleHref}
              className="text-xs tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300"
            >
              {toggleLabel}
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label={t.nav.toggleMenu}
          >
            <span
              className={`block w-6 h-[1.5px] bg-[var(--foreground)] transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-[var(--foreground)] transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-[var(--foreground)] transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-tight"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="mailto:mirek@sivak.ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 px-8 py-3 border border-[var(--accent)] text-[var(--accent)] text-lg tracking-wide"
            >
              {t.nav.getInTouch}
            </motion.a>
            <motion.a
              href={toggleHref}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-sm tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300"
            >
              {toggleLabel}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
