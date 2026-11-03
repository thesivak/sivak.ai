/* global URL */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { build } from 'esbuild';
const read = p => readFileSync(new URL('../' + p, import.meta.url));
const bundle = await build({entryPoints:['src/i18n/pages.ts'], bundle:true, write:false, format:'esm'});
const {pageIn, SITEMAP_PAGES} = await import(`data:text/javascript,${encodeURIComponent(bundle.outputFiles[0].text)}`);
test('security twins are paired and indexed', () => {
 assert.equal(pageIn('/ai-bezpecnost','en'),'/en/ai-security');
 assert.equal(pageIn('/en/ai-security','cs'),'/ai-bezpecnost');
 for(const p of ['/ai-bezpecnost','/en/ai-security']) {
  assert.ok(SITEMAP_PAGES.includes(p));
  assert.ok(read('wrangler.jsonc').toString().includes(JSON.stringify(p)));
 }
});
for(const [lang,path,price,consent,og] of [
 ['cs','/ai-bezpecnost','Cena na vyžádání','vždy s písemným souhlasem vedení','ai-bezpecnost'],
 ['en','/en/ai-security','Price on request','always with written consent from management','en-ai-security']
]) test(`${lang}: service content, consent, navigation and share image`,()=>{
 const page=parse(read(`src/content/topic/${lang}.yaml`).toString()).pages.find(p=>p.key==='security');
 assert.equal(page.path,path);
 assert.equal(page.sections[0].items.length,4);
 const copy=JSON.stringify(page);
 assert.ok(copy.includes(price)); assert.ok(copy.includes(consent)); assert.ok(copy.includes('Mirek Sivák'));
 assert.doesNotMatch(copy,/Zapfloor|certif|dotac|subsid|pilotní agent|Czech companies|české firmy|@|\+420/iu);
 const home=parse(read(`src/content/home/${lang}.yaml`).toString());
 assert.ok(home.nav.items.some(i=>i.href===path));
 assert.ok(home.services.items.some(i=>i.more?.href===path));
 const png=read(`public/og/${og}.png`);
 assert.equal(png.subarray(1,4).toString(),'PNG');
 assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[1200,630]);
});
