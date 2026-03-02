"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "./config";

interface DictionaryContextValue {
  t: Dictionary;
  lang: Locale;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({
  dictionary,
  lang,
  children,
}: {
  dictionary: Dictionary;
  lang: Locale;
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={{ t: dictionary, lang }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be used within DictionaryProvider");
  return ctx;
}
