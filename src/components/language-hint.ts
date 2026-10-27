// The language switch and the "Switch to English" / "Přepnout do češtiny" suggestion (LanguageHint.astro).
// The server never redirects by language: "/" is always Czech. Instead, when the browser's languages
// suggest the other version (no cs/sk on a Czech page, cs/sk on an English one) and the visitor has not
// chosen yet, a small suggestion appears once the page has rendered. A stored choice wins over the browser:
// the `lang` cookie, set when the switch or the suggestion is used, or the suggestion is closed.
const COOKIE = "lang";
const YEAR = 60 * 60 * 24 * 365;

function readChoice(): string | undefined {
  for (const pair of document.cookie.split(";")) {
    const [key, ...value] = pair.trim().split("=");
    if (key === COOKIE) return value.join("=") || undefined;
  }
}

function storeChoice(lang: string) {
  document.cookie = `${COOKIE}=${lang}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
}

const czechBrowser = () => (navigator.languages?.length ? navigator.languages : [navigator.language]).some((l) => /^(cs|sk)\b/i.test(l));

export function setupLanguage() {
  // Every language switch remembers the choice
  for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-lang-switch]")) {
    link.addEventListener("click", () => storeChoice(link.dataset.langSwitch!));
  }

  const hint = document.querySelector<HTMLElement>("[data-language-hint]");
  if (!hint) return;
  const pageLang = document.documentElement.lang;
  const target = hint.dataset.targetLang!;
  const choice = readChoice();
  const wanted = choice ? choice === target : target === "en" ? !czechBrowser() : czechBrowser();
  if (!wanted) return;

  hint.querySelector("[data-hint-close]")?.addEventListener("click", () => {
    storeChoice(pageLang);
    hint.hidden = true;
  });
  // After the page has rendered: never part of the first paint, so never the LCP element
  const show = () => (hint.hidden = false);
  const later = () => ("requestIdleCallback" in window ? requestIdleCallback(show, { timeout: 3000 }) : setTimeout(show, 1500));
  if (document.readyState === "complete") later();
  else addEventListener("load", later, { once: true });
}
