/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// The home page itself is tested in site.test.mjs; home/{cs,en}.yaml now feeds the training page's header and footer.
// SiteHeader's nav.items list (desktop and mobile); the footer mirrors it.
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
