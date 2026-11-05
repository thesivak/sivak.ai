/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { parse } from 'yaml';

const out = await build({ entryPoints: ['src/i18n/sections.ts'], bundle: true, write: false, format: 'esm' });
const { SECTION_IDS, sectionHashIn } = await import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);

for (const lang of ['cs', 'en']) {
  test(`${lang}: section map is bijective and covers all homepage section IDs`, () => {
    const home = parse(readFileSync(new URL(`../src/content/home/${lang}.yaml`, import.meta.url), 'utf8'));
    const ids = Object.values(home).filter(value => value && typeof value === 'object' && 'id' in value).map(value => value.id);
    const mapped = SECTION_IDS.map(pair => pair[lang]);
    assert.equal(new Set(mapped).size, mapped.length);
    assert.deepEqual(mapped.toSorted(), ids.toSorted());
  });
  test(`${lang}: maps every section from either language, including encoded fragments`, () => {
    for (const pair of SECTION_IDS) for (const source of ['cs', 'en']) {
      assert.equal(sectionHashIn(`#${pair[source]}`, lang), `#${pair[lang]}`);
      assert.equal(sectionHashIn('#' + [...pair[source]].map(c => '%' + c.charCodeAt(0).toString(16)).join(''), lang), `#${pair[lang]}`);
    }
    for (const hash of ['', '#main', '#unknown', '#%invalid']) assert.equal(sectionHashIn(hash, lang), hash);
  });
}

// Exercise the actual inline homepage script without a browser or network.
const { runInNewContext } = await import('node:vm');
const homepage = readFileSync(new URL('../src/components/HomePage.astro', import.meta.url), 'utf8');
const inline = homepage.match(/<script is:inline[^>]*>([\s\S]*?)<\/script>/)[1];
for (const lang of ['cs', 'en']) test(`${lang}: homepage normalizes on load and hashchange without adding history`, () => {
  const source = lang === 'cs' ? 'en' : 'cs';
  const location = { hash: `#${SECTION_IDS[0][source]}`, pathname: lang === 'cs' ? '/' : '/en', search: '?ref=test' };
  const events = {};
  const scrolled = [];
  const replacements = [];
  const history = { state: { retained: true }, replaceState: (state, title, url) => {
    replacements.push({ state, url });
    location.hash = url.slice(url.indexOf('#'));
  } };
  runInNewContext(inline, {
    sectionIds: SECTION_IDS, lang, location, history,
    document: { getElementById: id => SECTION_IDS.some(pair => pair[lang] === id) || id === 'main' ? { scrollIntoView: () => scrolled.push(id) } : null },
    window: { addEventListener: (event, callback) => { events[event] = callback; } },
  });
  assert.equal(location.hash, `#${SECTION_IDS[0][lang]}`);
  assert.equal(replacements[0].url, location.pathname + location.search + location.hash);
  assert.equal(replacements[0].state, history.state);
  for (const pair of SECTION_IDS.slice(1)) {
    location.hash = `#${pair[source]}`;
    events.hashchange();
    assert.equal(location.hash, `#${pair[lang]}`);
  }
  assert.deepEqual(scrolled, SECTION_IDS.map(pair => pair[lang]));
  for (const hash of [`#${SECTION_IDS[0][lang]}`, '#main', '#unknown', '#%invalid', '']) {
    location.hash = hash;
    events.hashchange();
    assert.equal(location.hash, hash);
  }
  assert.equal(replacements.length, SECTION_IDS.length);
});
