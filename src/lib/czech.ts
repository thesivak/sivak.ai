// Czech typesetting keeps one-letter prepositions and conjunctions ("v", "k", "a"…)
// on the same line as the next word, and never starts a line with a dash.
const LONE_LETTER = /(?<=^|[\s(„])([AaIiKkOoSsUuVvZz]) /g;

export function czechSpacing<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(LONE_LETTER, "$1 ").replaceAll(" – ", " – ") as T;
  }
  if (Array.isArray(value)) return value.map(czechSpacing) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, czechSpacing(v)])) as T;
  }
  return value;
}

// The same rule for rendered Markdown: only the text between tags changes, never markup or attributes
export function czechSpacingHtml(html: string): string {
  return html.replace(/>([^<]+)</g, (_, text: string) => `>${czechSpacing(text)}<`);
}
