import { CTA_DIAGNOSTICS, CTA_ESTIMATE, GUARANTEE, GUARANTEE_ID, HOW_WE_WORK_PATH, METHOD, NOT_DOING, NOT_DOING_ID, Q } from "./en-offer";
import type { Page } from "./types";

// The content pages that also exist in English, by the same key as their Czech twin in pages.ts
// (src/i18n/pages.ts → TWIN_PAGES). So far only "how we work"; the industry pages, results and the
// founder's manifesto are in Czech only. Content rules as in en.ts.
// PREVIEW (branch web-v3-preview): sections with `preview: true` state something Mirek has not confirmed;
// the site shows them with the tag "UKÁZKA – potvrdí Mirek" (src/site/preview.ts).
export const pagesEn = {
  process: {
    path: HOW_WE_WORK_PATH,
    name: "How we work",
    metadata: {
      title: "How we work: from payback estimate to operation | sivak.ai",
      description:
        "A free payback estimate, fixed-price AI diagnostics, a pilot on one process and operation with guaranteed response times. No payback, no build.",
    },
    title: "No payback, no build",
    lead: `We work by the ${METHOD} method. It has four phases, each with a fixed scope and a clear deliverable, and at the end of each one you decide whether to continue.`,
    sheet: {
      caption: "Example of a one-page payback estimate",
      title: "Process: order intake from email",
      rows: [
        ["Today", "Manual retyping from email and PDF into the ERP"],
        ["The agent takes over", "Reading the order, finding the items, a draft in the ERP"],
        ["Stays with people", "Checking and confirming"],
        ["Saving", "Hours per month, calculated from your volumes"],
        ["Payback", "In months, against the price of the pilot and operation"],
        ["Recommendation", "Continue with AI diagnostics"],
      ],
    },
    cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    sections: [
      {
        kind: "index",
        id: "phases",
        title: `The ${METHOD} method: four phases, you decide after each`,
        lead: "That is our name for the way we run every project: the number first, the build second. We start free and with a small step. You commit to the next phase only once the previous one has shown that it makes sense.",
        items: [
          {
            title: "0 · Payback estimate",
            text: "Free. In a 45-minute call we go through the process that costs you the most work. Then you get a one-page estimate. You decide whether you want the diagnostics.",
            points: ["45-minute call", "One-page payback estimate", "Free, no commitment"],
          },
          {
            title: "1 · AI diagnostics",
            text: "A two-day workshop with the people who do the process every day. It has a fixed price you know in advance; if a pilot follows, we deduct it from the pilot's price. You decide whether you want a pilot.",
            points: ["Map of the process", "Opportunities ranked by payback", "Clickable prototype on made-up data", "Fixed-price proposal"],
          },
          {
            title: "2 · Pilot",
            text: "We build an agent for one process. It takes 4–8 weeks, has a fixed price, and we measure the result against a baseline we measure together before the start. You decide whether the agent goes into operation.",
            points: ["One process", "4–8 weeks, fixed price", "Measured against the baseline"],
          },
          {
            title: "3 · Operation",
            text: "We run the agent, watch over it and adjust it when your process changes. You pay a monthly fee and your response times are guaranteed in the contract. Once it has proven itself, you decide what work it takes on next.",
            points: ["Operation and monitoring", "Adjustments", "Repeated security tests", "Guaranteed response times"],
          },
        ],
      },
      // UKÁZKA – potvrdí Mirek: unconfirmed guarantee, shown with the preview tag
      { kind: "prose", id: GUARANTEE_ID, preview: true, title: GUARANTEE.title, text: GUARANTEE.text },
      {
        kind: "points",
        id: "principles",
        title: "Principles we keep to",
        items: [
          { title: "No payback, no build", text: "We calculate the payback before we start. If it doesn't add up, we tell you and we don't build." },
          { title: "Fixed price up front", text: "Diagnostics and the pilot have a fixed price and scope. You know what you get and what you pay." },
          { title: "The agent prepares, a person decides", text: "Your person approves the important steps. Every action of the agent is recorded." },
          { title: "We build and attack", text: "Our security team tests what we build before we let it near your data." },
        ],
      },
      { ...NOT_DOING, id: NOT_DOING_ID },
      {
        kind: "prose",
        id: "security-review",
        title: "The second way in: a security review",
        text: [
          "Sometimes risk worries a company more than routine: what can be seen from the internet, who has access to company systems and what would happen if operations stood still for a week.",
          "Then we start with a security review. We find out how far an attacker would get and hand the findings to management by their impact on operations. AI agents come afterwards, on a safer footing.",
        ],
        link: { href: "/en/security", label: "Security and the security review" },
      },
      {
        kind: "questions",
        id: "faq",
        title: "What companies ask before we start",
        items: [
          Q.noReturn,
          {
            q: "Why are the diagnostics paid?",
            a: "We work with your people for two days and you take away a map of the process, ranked opportunities, a prototype and a fixed-price proposal. The outputs are yours even if you go no further with us. If a pilot follows, we deduct the price of the diagnostics from its price.",
          },
          {
            q: "How much do the pilot and operation cost?",
            a: "It depends on the process. You get the fixed price of the pilot and the monthly operating fee in the proposal at the end of the diagnostics, before you commit to anything.",
          },
          {
            q: "What if the pilot doesn't prove itself?",
            a: "We measure the result against the baseline we measured together before the start. If the numbers don't add up, we don't go into operation. The decision is yours.",
          },
          {
            q: "Who should take part in the diagnostics?",
            a: "The person who decides about the process and the people who do it every day. We bring in your IT once it comes to connecting the systems.",
          },
          Q.systems,
        ],
      },
    ],
    contact: {
      title: "Start with a payback estimate",
      lead: "It is free and commits you to nothing: a 45-minute call and a one-page estimate. If you already know which process you want to solve, order AI diagnostics straight away.",
      cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    },
  },
} satisfies Record<string, Page>;
