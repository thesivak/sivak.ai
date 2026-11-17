/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// The home page itself is tested in site.test.mjs; home/{cs,en}.yaml now feeds the training page's header and footer.
// SiteHeader's nav.items list (desktop and mobile); the footer mirrors it.
for (const [lang, labels, ids] of [
  ['cs', ['Co děláme', 'Jak to probíhá', 'Z praxe', 'Kontakt', 'AI bezpečnost', 'AI školení'],
    ['sluzby', 'postup', 'z-praxe', 'kontakt', 'ai-security', 'ai-skoleni']],
  ['en', ['What we do', 'How it works', 'In practice', 'Contact', 'AI security', 'AI training'],
    ['services', 'process', 'case-study', 'contact', 'ai-security', 'ai-training']],
]) test(lang + ': shared desktop, mobile and footer navigation has the exact order', () => {
  const home = parse(readFileSync(new URL('../src/content/home/' + lang + '.yaml', import.meta.url), 'utf8'));
  assert.deepEqual(home.nav.items.map(item => item.label), labels);
  assert.deepEqual(home.nav.items.map(item => item.id), ids);
});

// Every section link of the training page's header and footer lands on a section the home page has
const { build } = await import('esbuild');
const bundled = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'neutral' });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { cs } = await bundled('src/site/cs.ts');
const { en } = await bundled('src/site/en.ts');
const { SITEMAP_PAGES } = await bundled('src/i18n/pages.ts');
for (const [lang, site] of [['cs', cs], ['en', en]]) test(lang + ': no navigation item of the training page leads nowhere', () => {
  const home = parse(readFileSync(new URL('../src/content/home/' + lang + '.yaml', import.meta.url), 'utf8'));
  const sections = [site.home.services.id, site.home.work.id, site.home.questions.id, site.home.process.id, site.home.contact.id];
  for (const item of home.nav.items) {
    if (item.href) assert.ok(SITEMAP_PAGES.includes(item.href), item.href);
    else assert.ok(sections.includes(item.id), `#${item.id} is a section of the ${lang} home page`);
  }
});
