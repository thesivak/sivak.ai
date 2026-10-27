import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Copy lives in src/content:
//   home/{cs,en}.yaml        – the home page, one YAML file per language
//   faq/{cs,en}/*.md         – home page FAQ, one Markdown file per question (answer = body)
//   faq/ai-skoleni/*.md      – FAQ of the /ai-skoleni landing page
//   landing/ai-skoleni.yaml  – the /ai-skoleni landing page
// The home page is mostly short labels in fixed structures (agents with steps, spec tables,
// a permission manifest), so it stays structured data validated by the schemas below;
// the free-text answers are Markdown.

const text = z.string().min(1);
const pair = z.tuple([text, text]);
const section = { id: text, eyebrow: text, title: text };

const home = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/home" }),
  schema: z.object({
    metadata: z.object({ title: text, description: text }),
    skipLink: text,
    langSwitch: z.object({ label: text, title: text }),
    nav: z.object({
      label: text,
      home: text,
      // href: a link to another page (e.g. /ai-skoleni) instead of the section #id;
      // hreflang: that page's language when it differs from this one (the Czech-only /ai-skoleni from /en)
      items: z.array(z.object({ id: text, label: text, href: z.string().optional(), hreflang: z.string().optional() })),
      cta: text,
      open: text,
      close: text,
    }),
    hero: z.object({
      eyebrow: text,
      title: text,
      titleAccent: text,
      lead: text,
      gain: z.object({ figure: text, title: text, text: text }),
      primary: text,
      secondary: text,
      notes: z.array(text),
    }),
    console: z.object({
      label: text,
      caption: text,
      app: text,
      live: text,
      agentsLabel: text,
      preparing: text,
      states: z.object({ running: text, waiting: text, done: text }),
      footer: z.array(text),
      agents: z
        .array(
          z.object({
            short: text,
            name: text,
            task: text,
            steps: z.array(z.object({ text: text, result: text, time: text })).min(1),
            state: z.enum(["waiting", "done"]),
            outcome: text,
            action: text,
          }),
        )
        .min(1),
    }),
    ratio: z.object({
      id: text,
      eyebrow: text,
      title: text,
      text: text,
      routine: z.object({ share: text, label: text, items: z.array(text) }),
      people: z.object({ share: text, label: text, items: z.array(text) }),
    }),
    services: z.object({
      ...section,
      lead: text,
      items: z.array(z.object({ title: text, text: text, tags: z.array(text) })),
      // Teaser for /ai-skoleni under the service cards
      training: z.object({ label: text, title: text, text: text, cta: text, href: z.string(), hreflang: z.string().optional() }).optional(),
    }),
    useCases: z.object({
      ...section,
      lead: text,
      outputLabel: text,
      items: z.array(z.object({ area: text, text: text, output: text })),
      more: text,
      moreLink: text,
    }),
    process: z.object({
      ...section,
      lead: text,
      outputLabel: text,
      steps: z.array(z.object({ title: text, text: text, output: text })),
    }),
    deployment: z.object({
      ...section,
      lead: text,
      options: z.array(
        z.object({
          title: text,
          text: text,
          specs: z.array(pair),
          fit: text,
          badge: z.string(),
          highlight: z.boolean(),
        }),
      ),
    }),
    control: z.object({
      ...section,
      lead: text,
      manifest: z.object({
        label: text,
        file: text,
        agent: pair,
        accessKey: text,
        access: z.array(pair),
        rest: z.array(pair),
      }),
      items: z.array(z.object({ title: text, text: text })),
    }),
    case: z.object({
      ...section,
      lead: text,
      status: text,
      agents: z.array(z.object({ name: text, text: text, meta: text })),
      facts: z.array(text),
    }),
    faq: z.object(section),
    contact: z.object({
      ...section,
      lead: text,
      cta: text,
      mailSubject: text,
      saveContact: text,
      emailLabel: text,
      phoneLabel: text,
    }),
    footer: z.object({
      tagline: text,
      navLabel: text,
      contactLabel: text,
      operatedBy: text,
      idLabel: text,
      registry: text,
    }),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({ question: text, order: z.number().int() }),
});

const card = z.object({ title: text, text: text });

const landing = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/landing" }),
  schema: z.object({
    metadata: z.object({ title: text, description: text, ogTitle: text, ogDescription: text }),
    nav: z.object({ items: z.array(z.object({ id: text, label: text })), cta: text }),
    hero: z.object({
      eyebrow: text,
      title: text,
      titleAccent: text,
      lead: text,
      trainerLabel: text,
      trainerNote: text,
      price: z.object({ figure: text, unit: text }),
      primary: text,
      secondary: text,
    }),
    audience: z.object({ ...section, lead: text, items: z.array(card), note: text }),
    program: z.object({
      ...section,
      lead: text,
      parts: z.array(z.object({ label: text, blocks: z.array(card.extend({ points: z.array(text) })) })),
      note: text,
    }),
    trainer: z.object({
      ...section,
      name: text,
      role: text,
      bio: z.array(text),
      facts: z.array(text),
      linkedinLabel: text,
    }),
    reference: z.object({ ...section, name: text, client: text, text: z.array(text), facts: z.array(text), link: text }),
    price: z.object({
      ...section,
      figure: text,
      unit: text,
      includedLabel: text,
      included: z.array(text),
      cta: text,
    }),
    faq: z.object(section),
    form: z.object({
      ...section,
      lead: text,
    }),
  }),
});

export const collections = { home, faq, landing };
