"use client";

import { useDictionary } from "@/i18n/DictionaryContext";

export default function Footer() {
  const { t } = useDictionary();

  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-[family-name:var(--font-syne)] text-sm font-600 tracking-tight">
          sivak<span className="text-[var(--accent)]">.ai</span>
        </span>
        <span className="text-xs text-[var(--muted)] tracking-wide">
          &copy; {new Date().getFullYear()} {t.footer.copyright}
        </span>
      </div>
    </footer>
  );
}
