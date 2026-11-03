/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

for (const lang of ['cs', 'en']) test(lang + ': homepage copy follows content rules', () => {
  const home = parse(readFileSync(new URL('../src/content/home/' + lang + '.yaml', import.meta.url), 'utf8'));
  const copy = JSON.stringify(home);
  assert.doesNotMatch(copy, /Zapfloor|certif|dotac|subsid|\bgrants?\b|české firmy|Czech companies|Miroslav|vednými/iu);
  assert.doesNotMatch(copy, /\b\d[\d\s.,]*\s*(?:Kč|CZK|EUR|USD)|[€$]\s*\d|\d+\s+agents?\s+(?:running|active)/iu);
  assert.ok(home.metadata.title.length <= 60);
  assert.ok(home.metadata.description.length >= 120 && home.metadata.description.length <= 160);
  assert.equal(home.hero.title.trim(), lang === 'cs' ? 'AI systémy' : 'AI systems');
  assert.equal(home.hero.titleAccent, lang === 'cs' ? 'a bezpečnost' : 'and security');
  assert.ok(home.hero.notes.includes(lang === 'cs' ? 'Ochrana před útoky vedenými pomocí AI' : 'Protection against AI-powered attacks'));
});

// Desktop and mobile share SiteHeader's nav.items list; the footer mirrors it.
for (const [lang, labels, ids] of [
  ['cs', ['Co děláme', 'Jak to probíhá', 'Kontrola', 'Z praxe', 'Kontakt', 'AI bezpečnost', 'AI školení'],
    ['sluzby', 'postup', 'bezpecnost', 'z-praxe', 'kontakt', 'ai-security', 'ai-skoleni']],
  ['en', ['What we do', 'How it works', 'Control', 'In practice', 'Contact', 'AI security', 'AI training'],
    ['services', 'process', 'security', 'case-study', 'contact', 'ai-security', 'ai-training']],
]) test(lang + ': shared desktop, mobile and footer navigation has the exact order', () => {
  const home = parse(readFileSync(new URL('../src/content/home/' + lang + '.yaml', import.meta.url), 'utf8'));
  assert.deepEqual(home.nav.items.map(item => item.label), labels);
  assert.deepEqual(home.nav.items.map(item => item.id), ids);
});
