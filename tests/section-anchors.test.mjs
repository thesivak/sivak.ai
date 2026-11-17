/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const bundle = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'neutral' });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { SECTION_IDS, UNPAIRED_SECTION_IDS, sectionHashIn } = await bundle('src/i18n/sections.ts');
const sites = { cs: (await bundle('src/site/cs.ts')).cs, en: (await bundle('src/site/en.ts')).en };
// The sections the home page really has (src/components/site/Home.astro renders exactly these ids)
const homeSections = (lang) => {
  const h = sites[lang].home;
  return [h.audience, h.services, h.work, h.questions, h.process, h.contact].filter(Boolean).map(section => section.id);
};

for (const lang of ['cs', 'en']) {
  const other = lang === 'cs' ? 'en' : 'cs';
  test(`${lang}: every home page section is paired with the other language or listed as unpaired`, () => {
    const paired = SECTION_IDS.map(pair => pair[lang]);
    const unpaired = UNPAIRED_SECTION_IDS[lang];
    assert.equal(new Set([...paired, ...unpaired]).size, paired.length + unpaired.length);
    assert.deepEqual([...paired, ...unpaired].toSorted(), homeSections(lang).toSorted());
    // Home.astro gives each of them an element
    const template = readFileSync(new URL('../src/components/site/Home.astro', import.meta.url), 'utf8');
    for (const key of ['audience', 'services', 'work', 'questions', 'process', 'contact']) assert.match(template, new RegExp(`id=\\{h\\.${key}\\.id\\}`), key);
  });
  test(`${lang}: maps every section from either language, including encoded fragments`, () => {
    for (const pair of SECTION_IDS) for (const source of ['cs', 'en']) {
      assert.equal(sectionHashIn(`#${pair[source]}`, lang), `#${pair[lang]}`);
      assert.equal(sectionHashIn('#' + [...pair[source]].map(c => '%' + c.charCodeAt(0).toString(16)).join(''), lang), `#${pair[lang]}`);
    }
    for (const hash of ['', '#main', '#unknown', '#%invalid']) assert.equal(sectionHashIn(hash, lang), hash);
  });
  // Regression: "Pro koho" then "English" led to /en#pro-koho, a section the English page does not have
  test(`${lang}: the language switch drops a section the ${lang} page does not have`, () => {
    for (const id of homeSections(other)) {
      const hash = sectionHashIn(`#${id}`, lang);
      assert.ok(hash === '' || homeSections(lang).includes(hash.slice(1)), `#${id} → "${hash}"`);
    }
    for (const id of UNPAIRED_SECTION_IDS[other]) {
      assert.equal(sectionHashIn(`#${id}`, lang), '');
      assert.equal(sectionHashIn('#' + encodeURIComponent(id), lang), '');
    }
    // Its own sections stay
    for (const id of UNPAIRED_SECTION_IDS[lang]) assert.equal(sectionHashIn(`#${id}`, lang), `#${id}`);
  });
}
test('"Pro koho" then "English" leads to /en, not /en#pro-koho', () => {
  const hash = new URL(sites.cs.menu.main[0].href, 'https://www.sivak.ai').hash;
  assert.equal(hash, '#pro-koho');
  assert.equal('/en' + sectionHashIn(hash, 'en'), '/en');
  // The header builds the link exactly this way
  assert.match(readFileSync(new URL('../src/components/site/Header.astro', import.meta.url), 'utf8'), /link\.href = base \+ sectionHashIn\(window\.location\.hash, lang\)/);
});

// Exercise the actual inline homepage script without a browser or network.
const { runInNewContext } = await import('node:vm');
const homepage = readFileSync(new URL('../src/components/site/Home.astro', import.meta.url), 'utf8');
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
