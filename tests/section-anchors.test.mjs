/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const bundle = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'neutral' });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { SECTION_IDS, PAGE_SECTION_IDS, SHARED_SECTION_IDS, UNPAIRED_SECTION_IDS, sectionHashIn } = await bundle('src/i18n/sections.ts');
const contentPages = { cs: (await bundle('src/site/pages.ts')).pages, en: (await bundle('src/site/pages-en.ts')).pagesEn };
const sites = { cs: (await bundle('src/site/cs.ts')).cs, en: (await bundle('src/site/en.ts')).en };
// The sections the home page really has (src/components/site/Home.astro renders exactly these ids)
const homeSections = (lang) => {
  const h = sites[lang].home;
  return [h.gain, h.audience, h.pillars, h.services, h.notDoing, h.work, h.questions, h.process, h.contact].filter(Boolean).map(section => section.id);
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
    for (const key of ['audience', 'pillars', 'services', 'notDoing', 'work', 'questions', 'process', 'contact']) assert.match(template, new RegExp(`id=\\{h\\.${key}\\.id\\}`), key);
    // The section under the hero is a component of its own, given the home page's copy
    assert.match(template, /<AgentGain t=\{h\.gain\} \/>/);
    assert.match(readFileSync(new URL('../src/components/site/AgentGain.astro', import.meta.url), 'utf8'), /id=\{t\.id\}/);
  });
  test(`${lang}: maps every section from either language, including encoded fragments`, () => {
    for (const pair of SECTION_IDS) for (const source of ['cs', 'en']) {
      assert.equal(sectionHashIn(`#${pair[source]}`, lang), `#${pair[lang]}`);
      assert.equal(sectionHashIn('#' + [...pair[source]].map(c => '%' + c.charCodeAt(0).toString(16)).join(''), lang), `#${pair[lang]}`);
    }
    // An id both languages share stays; an unknown or malformed fragment is dropped, not carried to a page without it
    for (const id of SHARED_SECTION_IDS) assert.equal(sectionHashIn(`#${id}`, lang), `#${id}`);
    for (const hash of ['', '#', '#unknown', '#%invalid', '#section-3']) assert.equal(sectionHashIn(hash, lang), '');
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
// The English page has the section too since it follows the Czech positioning: the fragment is translated
test('"Pro koho" then "English" leads to the English section, not to /en#pro-koho', () => {
  const hash = new URL(sites.cs.menu.main[0].href, 'https://www.sivak.ai').hash;
  assert.equal(hash, '#pro-koho');
  assert.equal('/en' + sectionHashIn(hash, 'en'), `/en#${sites.en.home.audience.id}`);
  assert.equal(new URL(sites.en.menu.main[0].href, 'https://www.sivak.ai').hash, `#${sites.en.home.audience.id}`);
  // The header builds the link exactly this way
  assert.match(readFileSync(new URL('../src/components/site/Header.astro', import.meta.url), 'utf8'), /link\.href = base \+ sectionHashIn\(window\.location\.hash, lang\)/);
});

// Regression: /jak-pracujeme#faze then "English" led to /en/how-we-work#faze, an anchor that page does not have
test('content pages in both languages: every section maps to its twin, both ways', () => {
  const keys = Object.keys(contentPages.en);
  assert.ok(keys.length > 0);
  for (const key of keys) {
    const ids = { cs: contentPages.cs[key].sections.map(section => section.id), en: contentPages.en[key].sections.map(section => section.id) };
    assert.equal(ids.cs.length, ids.en.length, key);
    assert.ok([...ids.cs, ...ids.en].every(Boolean), `${key}: every section has an id`);
    ids.cs.forEach((id, i) => {
      assert.equal(sectionHashIn(`#${id}`, 'en'), `#${ids.en[i]}`, `${key}: #${id} → en`);
      assert.equal(sectionHashIn(`#${ids.en[i]}`, 'cs'), `#${id}`, `${key}: #${ids.en[i]} → cs`);
      assert.equal(sectionHashIn(`#${id}`, 'cs'), `#${id}`);
      assert.equal(sectionHashIn(`#${ids.en[i]}`, 'en'), `#${ids.en[i]}`);
    });
    // The contact section at the end of the page (ContentPage.astro gives it the home page's contact id)
    assert.equal(sectionHashIn(`#${sites.cs.home.contact.id}`, 'en'), `#${sites.en.home.contact.id}`);
    assert.equal(sectionHashIn(`#${sites.en.home.contact.id}`, 'cs'), `#${sites.cs.home.contact.id}`);
  }
  assert.equal(sectionHashIn('#faze', 'en'), '#phases');
  assert.equal(sectionHashIn('#phases', 'cs'), '#faze');
  assert.equal(sectionHashIn('#zasady', 'en'), '#principles');
  assert.equal(sectionHashIn('#principles', 'cs'), '#zasady');
  assert.equal(sectionHashIn('#bezpecnostni-proverka', 'en'), '#security-review');
  assert.equal(sectionHashIn('#security-review', 'cs'), '#bezpecnostni-proverka');
  // No id is paired twice, and no shared id is also one side of a pair
  const all = [...SECTION_IDS, ...PAGE_SECTION_IDS].flatMap(pair => [pair.cs, pair.en]);
  assert.equal(new Set(all).size, all.length);
  assert.ok(SHARED_SECTION_IDS.every(id => !all.includes(id)));
  // The sections of a Czech-only page have no twin: the fragment is dropped
  for (const id of ['co-slychame', 'startovni-nabidky', 'kde-mizi-penize', 'softwarova-firma']) assert.equal(sectionHashIn(`#${id}`, 'en'), '');
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
