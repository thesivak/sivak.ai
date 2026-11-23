/* global Request, URL, URLSearchParams, Response */
// Run with `npm test`. The enquiry dialog that every call to action opens: the buttons, the shared
// validation, the API (POST /api/poptavka) with its rate limit, honeypot and Turnstile check, what is stored
// in D1, the notification e-mail, and the footer's legal line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
// The Worker runtime module is not available in Node: an empty `env` is enough for what these tests call
const workersStub = {
  name: "cloudflare-workers-stub",
  setup(b) {
    b.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: "cloudflare:workers", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const env = {};", loader: "js" }));
  },
};
const bundle = async (entry) => {
  const out = await build({ entryPoints: [`${root}${entry}`], bundle: true, write: false, format: "esm", platform: "neutral", alias: { "@": `${root}src` }, plugins: [workersStub] });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { CONSENT, SUPPORTED_CONSENT_VERSIONS, enquirySource, formLang, validateEnquiry } = await bundle("src/lib/enquiry/fields.ts");
const { buildMessage, isTestEnquiry } = await bundle("src/lib/server/notify.ts");
const { handleEnquiry } = await bundle("src/lib/server/enquiry.ts");
const { LIMIT } = await bundle("src/lib/server/rate-limit.ts");
const { cs } = await bundle("src/site/cs.ts");
const { en } = await bundle("src/site/en.ts");
const read = (path) => readFileSync(`${root}${path}`, "utf8");

// ——— The buttons ———

test("marketing calls to action open the enquiry dialog, not an e-mail", () => {
  assert.doesNotMatch(read("src/lib/site.ts"), /meetingHref/);
  for (const file of ["Home", "ContentPage", "ServicePage", "ContactBlock", "Header"]) {
    const source = read(`src/components/site/${file}.astro`);
    assert.doesNotMatch(source, /meetingHref|mailto:[^`]*\?(cc|subject)=/, file);
    assert.match(source, /<EnquiryButton\b/, file);
  }
  // Hero, contact block and header: each says where it is
  assert.match(read("src/components/site/Home.astro"), /<EnquiryButton label=\{h\.hero\.cta\[0\]\.label\} place="hero"/);
  assert.match(read("src/components/site/ContactBlock.astro"), /<EnquiryButton label=\{main\.label\} place=\{id\}/);
  assert.match(read("src/components/site/Header.astro"), /<EnquiryButton label=\{t\.nav\.cta\} place="header"/);
  // The header button no longer jumps to the contact section
  assert.doesNotMatch(read("src/components/site/Header.astro"), /class="btn btn-small" href=/);
  const button = read("src/components/site/EnquiryButton.astro");
  assert.match(button, /<button type="button"[^>]*aria-haspopup="dialog"[^>]*data-enquiry-open[^>]*data-enquiry-cta=\{label\}[^>]*data-enquiry-place=\{place\}/);
  // Every page of the redesign has the dialog
  assert.match(read("src/components/site/Shell.astro"), /<EnquiryDialog lang=\{lang\} \/>/);
});

test("genuine contact links stay e-mail links", () => {
  // The people in the contact block and the footer keep their addresses; vCards stay downloads
  assert.match(read("src/components/site/ContactBlock.astro"), /href=\{`mailto:\$\{person\.email\}`\}/);
  assert.match(read("src/components/site/ContactBlock.astro"), /href=\{person\.vcard\} download/);
  assert.match(read("src/components/site/Footer.astro"), /href=\{`mailto:\$\{person\.email\}`\}/);
  assert.match(read("src/pages/ochrana-osobnich-udaju.astro"), /href="mailto:\$\{contact\}"/);
});

test("the dialog is an accessible modal with the fields the server expects", () => {
  const dialog = read("src/components/site/EnquiryDialog.astro");
  assert.match(dialog, /<dialog class="enq" id="enquiry" aria-modal="true" aria-labelledby="enquiry-title"/);
  assert.match(dialog, /id="enquiry-title"/);
  assert.match(dialog, /action="\/api\/poptavka"/);
  for (const name of ["FIELD.message", "FIELD.website", "FIELD.consent", "FIELD.consentVersion", "FIELD.lang", "FIELD.cta", "FIELD.ctaPlace", "FIELD.page"]) assert.ok(dialog.includes(`name={${name}}`), name);
  // No phone or participants any more; company is optional
  assert.doesNotMatch(dialog, /phone|participants/);
  assert.match(dialog, /name: FIELD\.company[^\n]*required: false/);
  assert.match(dialog, /name: FIELD\.name[^\n]*required: true/);
  assert.match(dialog, /name: FIELD\.email[^\n]*required: true/);
  // Focus in, back to the opener, Escape (native), backdrop click
  const script = read("src/components/enquiry-dialog.ts");
  assert.match(script, /showModal\(\)/);
  assert.match(script, /addEventListener\("close"/);
  assert.match(script, /event\.target === dialog/);
  // No test key in the source: the site key comes from the build environment
  assert.match(dialog, /import\.meta\.env\.PUBLIC_TURNSTILE_SITE_KEY/);
  for (const file of ["src/components/site/EnquiryDialog.astro", "wrangler.jsonc", "src/lib/site.ts"]) assert.doesNotMatch(read(file), /1x0{20}AA/, file);
});

// ——— Validation ———

const VALID = { name: "Jana Nováková", email: "Jana@Example.com", message: "Chceme ušetřit práci s objednávkami.", consent: "on" };

test("validation: name, e-mail, message and the checkbox are required; company is optional", () => {
  const empty = validateEnquiry({});
  assert.equal(empty.ok, false);
  assert.deepEqual(Object.keys(empty.errors).sort(), ["consent", "email", "message", "name"]);
  assert.equal(empty.errors.name, "Vyplňte jméno.");
  assert.equal(empty.errors.message, "Vyplňte zprávu.");
  assert.equal(validateEnquiry({ ...VALID, name: "J" }).errors.name, "Vyplňte jméno (aspoň 2 znaky).");
  assert.equal(validateEnquiry({ ...VALID, message: "Ahoj" }).errors.message, "Vyplňte zprávu (aspoň 10 znaků).");
  assert.equal(validateEnquiry({ ...VALID, email: "x" }).errors.email, "Zadejte platnou e-mailovou adresu.");
  assert.equal(validateEnquiry({ ...VALID, consent: "" }).errors.consent, "Potvrďte prosím, že jste se seznámili se zpracováním osobních údajů.");

  const ok = validateEnquiry(VALID);
  assert.equal(ok.ok, true);
  assert.equal(ok.value.company, null);
  assert.equal(ok.value.email, "jana@example.com");
  assert.ok(!("phone" in ok.value) && !("participants" in ok.value));
  assert.equal(validateEnquiry({ ...VALID, company: "  Acme  " }).value.company, "Acme");
  // Given, the company has to look like a name
  assert.match(validateEnquiry({ ...VALID, company: "A" }).errors.company, /nebo pole nechte prázdné/);
  assert.equal(validateEnquiry({ ...VALID, company: "x".repeat(151) }).ok, false);
});

test("validation in English, and the form's language", () => {
  assert.equal(formLang({ lang: "en" }), "en");
  assert.equal(formLang({}), "cs");
  assert.ok(SUPPORTED_CONSENT_VERSIONS.includes(CONSENT.en.version) && SUPPORTED_CONSENT_VERSIONS.includes(CONSENT.cs.version));
  const en = validateEnquiry({ email: "x" }, "en");
  assert.equal(en.errors.email, "Please enter a valid email address.");
  assert.equal(en.errors.name, "Please enter your name.");
  assert.equal(en.errors.message, "Please enter a message.");
  assert.equal(validateEnquiry({ ...VALID }, "en").ok, true);
});

test("the source records language, page, place and button, and is cleaned up", () => {
  const value = (extra) => validateEnquiry({ ...VALID, ...extra }).value.origin;
  assert.equal(enquirySource(value({ page: "/", cta_place: "hero", cta: "Objednat AI diagnostiku" })), "cs:/#hero:Objednat AI diagnostiku");
  assert.equal(enquirySource(validateEnquiry({ ...VALID, page: "/en/security", cta_place: "contact", cta: "Book a security review" }, "en").value.origin), "en:/en/security#contact:Book a security review");
  // The Czech copy's no-break spaces become plain ones
  assert.equal(value({ cta: "Odhad návratnosti zdarma" }).cta, "Odhad návratnosti zdarma");
  // Anything that is not a path or a place id is dropped, never an error
  assert.deepEqual(value({ page: "https://evil.example/", cta_place: "<script>" }), { lang: "cs", page: "", place: "", cta: "" });
  assert.equal(enquirySource(value({})), "cs:?:?");
  assert.equal(value({ cta: "x".repeat(500) }).cta.length, 120);
});

// ——— The API ———

/** A D1 stand-in: counts rate-limit attempts like the real statement and records inserted enquiries */
function fakeDb() {
  const db = { attempts: 0, rows: [] };
  const statement = (sql) => ({
    sql,
    args: [],
    bind(...args) {
      this.args = args;
      return this;
    },
    async first() {
      if (sql.includes("INSERT INTO enquiries")) {
        db.rows.push({ sql, args: this.args });
        return { id: db.rows.length };
      }
      return null;
    },
    async run() {
      return { meta: { changes: 0 } };
    },
  });
  db.prepare = statement;
  db.batch = async (statements) =>
    statements.map((s) => {
      if (s.sql.includes("INSERT INTO enquiry_attempts")) {
        db.attempts += 1;
        return { meta: { changes: db.attempts <= LIMIT ? 1 : 0 } };
      }
      return { meta: { changes: 0 } };
    });
  return db;
}

const PRODUCTION = { SITE_ENV: "production", IP_HASH_SALT: "salt", TURNSTILE_SECRET_KEY: "0x4AAAAAAA-real-looking-secret" };

function post(fields, { referer = "https://www.sivak.ai/", ip = "203.0.113.7" } = {}) {
  return new Request("https://www.sivak.ai/api/poptavka", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", Referer: referer, "CF-Connecting-IP": ip },
    body: new URLSearchParams(fields).toString(),
  });
}

const FORM = {
  name: "Jana Nováková",
  email: "jana@example.com",
  message: "Chceme ušetřit práci s objednávkami.",
  consent: "on",
  consent_version: CONSENT.cs.version,
  lang: "cs",
  cta: "Objednat AI diagnostiku",
  cta_place: "hero",
  page: "/",
  "cf-turnstile-response": "token",
};

/** Calls the handler with a stubbed Turnstile siteverify; returns the response, its JSON and what was verified */
async function send(request, env, { turnstile = true } = {}) {
  const verified = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    verified.push({ url: String(url), token: init.body.get("response") });
    return Response.json({ success: turnstile });
  };
  try {
    const pending = [];
    const res = await handleEnquiry(request, { env, waitUntil: (p) => pending.push(p) });
    await Promise.all(pending);
    return { res, body: await res.json(), verified };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("API: a valid enquiry is verified with Turnstile and stored with its source", async () => {
  const DB = fakeDb();
  const { res, body, verified } = await send(post(FORM), { ...PRODUCTION, DB });
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(verified.length, 1);
  assert.match(verified[0].url, /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.equal(verified[0].token, "token");
  assert.equal(DB.rows.length, 1);
  const [createdAt, source, name, company, email, message] = DB.rows[0].args;
  assert.ok(createdAt);
  assert.equal(source, "cs:/#hero:Objednat AI diagnostiku");
  assert.deepEqual([name, company, email, message], ["Jana Nováková", "", "jana@example.com", "Chceme ušetřit práci s objednávkami."]);
  // phone and participants are written as NULL
  assert.match(DB.rows[0].sql, /VALUES \(\?, \?, \?, \?, \?, NULL, NULL, \?/);
});

test("API: the page falls back to the Referer, and the English form answers in English", async () => {
  const DB = fakeDb();
  const fields = { ...FORM, lang: "en", consent_version: CONSENT.en.version, cta: "Book a meeting", cta_place: "contact" };
  delete fields.page;
  const { body } = await send(post(fields, { referer: "https://www.sivak.ai/en/software-development?utm_source=linkedin" }), { ...PRODUCTION, DB });
  assert.equal(body.message, "Thank you, we have received your enquiry. We will get back to you as soon as possible.");
  const args = DB.rows[0].args;
  assert.equal(args[1], "en:/en/software-development#contact:Book a meeting");
  assert.ok(args.includes("linkedin") && args.includes("/en/software-development?utm_source=linkedin"));
});

test("API: production checks Turnstile and refuses without a real secret", async () => {
  // Rejected token
  let DB = fakeDb();
  let result = await send(post(FORM), { ...PRODUCTION, DB }, { turnstile: false });
  assert.equal(result.res.status, 400);
  assert.match(result.body.message, /robot/);
  assert.equal(DB.rows.length, 0);
  // No token at all
  DB = fakeDb();
  result = await send(post({ ...FORM, "cf-turnstile-response": "" }), { ...PRODUCTION, DB });
  assert.equal(result.res.status, 400);
  assert.equal(result.verified.length, 0);
  assert.equal(DB.rows.length, 0);
  // No secret, or Cloudflare's test secret: nothing is accepted in production
  for (const secret of [undefined, "1x0000000000000000000000000000000AA"]) {
    DB = fakeDb();
    result = await send(post(FORM), { ...PRODUCTION, TURNSTILE_SECRET_KEY: secret, DB });
    assert.equal(result.res.status, 503, String(secret));
    assert.equal(DB.rows.length, 0);
  }
  // The test site key's dummy token
  DB = fakeDb();
  result = await send(post({ ...FORM, "cf-turnstile-response": "XXXX.DUMMY.TOKEN.XXXX" }), { ...PRODUCTION, DB });
  assert.equal(result.res.status, 503);
});

test("API: rate limit, honeypot, validation and an outdated form", async () => {
  const DB = fakeDb();
  const env = { ...PRODUCTION, DB };
  for (let i = 0; i < LIMIT; i++) assert.equal((await send(post(FORM), env)).res.status, 200);
  const limited = await send(post(FORM), env);
  assert.equal(limited.res.status, 429);
  assert.equal(DB.rows.length, LIMIT);

  // Honeypot: a success for the bot, nothing stored, no Turnstile call
  const trapDb = fakeDb();
  const trap = await send(post({ ...FORM, website: "https://spam.example" }), { ...PRODUCTION, DB: trapDb });
  assert.equal(trap.res.status, 200);
  assert.equal(trap.body.ok, true);
  assert.equal(trapDb.rows.length, 0);
  assert.equal(trap.verified.length, 0);

  // The server validates on its own: company may be missing, the message may not
  const invalidDb = fakeDb();
  const invalid = await send(post({ ...FORM, message: "" }), { ...PRODUCTION, DB: invalidDb });
  assert.equal(invalid.res.status, 400);
  assert.deepEqual(Object.keys(invalid.body.errors), ["message"]);
  assert.equal(invalidDb.rows.length, 0);

  const stale = await send(post({ ...FORM, consent_version: "old" }), { ...PRODUCTION, DB: fakeDb() });
  assert.equal(stale.res.status, 409);
});

// ——— The notification ———

const enquiry = (extra = {}) => ({
  name: "Jana Nováková",
  email: "jana@example.com",
  company: null,
  message: "Chceme ušetřit práci s objednávkami.\nMáme ERP Helios.",
  consent: true,
  origin: { lang: "cs", page: "/ai-reseni", place: "hero", cta: "Objednat AI diagnostiku" },
  tracking: {},
  landingUrl: null,
  ...extra,
});

test("the notification is a general enquiry naming the button, page and language", () => {
  const cs = buildMessage(enquiry(), 7, "https://www.sivak.ai");
  assert.equal(cs.subject, "Poptávka z webu: Objednat AI diagnostiku – Jana Nováková");
  assert.doesNotMatch(cs.subject + cs.text + cs.html, /školení|AI training/iu);
  for (const part of ["Jana Nováková", "jana@example.com", "Máme ERP Helios.", "Objednat AI diagnostiku", "www.sivak.ai/ai-reseni (hero)", "čeština", "cs:/ai-reseni#hero:Objednat AI diagnostiku", "#7"]) {
    assert.ok(cs.text.includes(part), part);
  }
  // No company: no empty row
  assert.doesNotMatch(cs.text, /Firma:/);

  const en = buildMessage(enquiry({ company: "Acme", origin: { lang: "en", page: "/en", place: "header", cta: "Free payback estimate" } }), 8, "https://www.sivak.ai");
  assert.equal(en.subject, "Poptávka z webu [EN]: Free payback estimate – Jana Nováková, Acme");
  assert.ok(en.text.includes("Firma: Acme") && en.text.includes("angličtina"));
  // Input is escaped in the HTML part, and line breaks never reach the subject
  const hostile = buildMessage(enquiry({ name: "<b>Eve</b>\nBcc: x@example.com" }), 9, "https://www.sivak.ai");
  assert.ok(!hostile.html.includes("<b>Eve</b>") && hostile.html.includes("&lt;b&gt;Eve&lt;/b&gt;"));
  assert.doesNotMatch(hostile.subject, /[\r\n]/);
  // A test submission is marked, with or without a company
  assert.equal(isTestEnquiry(enquiry({ name: "TEST Jana" })), true);
  assert.equal(isTestEnquiry(enquiry({ company: "TEST s.r.o." })), true);
  assert.equal(isTestEnquiry(enquiry()), false);
  assert.match(buildMessage(enquiry({ name: "TEST Jana" }), 1, "https://www.sivak.ai").subject, /^\[TEST\] /);
});

// ——— Footer ———

test("the footer's legal line starts with the company name", () => {
  const footer = read("src/components/site/Footer.astro");
  assert.match(footer, /<p>\{COMPANY\.legalName\}, \{f\.seatLabel\} \{seatAddress\(lang\)\}, \{f\.idLabel\}\{"\u00a0"\}\{COMPANY\.ico\}\. \{f\.registry\}<\/p>/);
  assert.doesNotMatch(footer, /operatedBy/);
  for (const site of [cs, en]) {
    assert.ok(!("operatedBy" in site.footer));
    assert.doesNotMatch(JSON.stringify([site.footer.seatLabel, site.footer.idLabel, site.footer.registry]), /provozuje|is operated by/);
  }
  assert.equal(cs.footer.seatLabel, "se sídlem");
  assert.equal(cs.footer.idLabel, "IČO");
  assert.equal(en.footer.seatLabel, "registered office");
  assert.equal(en.footer.idLabel, "Company ID");
});
