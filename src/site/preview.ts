// NÁHLED (větev web-v3-preview): štítek u hodnot, které Mirek ještě nepotvrdil (termín ve slibu, záruka,
// výsledek s číslem, doba uchování v Google Analytics). Stejný text v češtině i v angličtině, aby se dal
// najít jedním hledáním. Před nasazením nesmí na webu zůstat ani štítek, ani zástupné „[X]“:
// `npm run verify:release` na ně spadne (scripts/verify-seo.mjs --release).
export const PREVIEW_LABEL = "UKÁZKA – potvrdí Mirek";
/** Zástupný znak místo čísla, které zatím nemáme. */
export const PREVIEW_FIGURE = "[X]";
