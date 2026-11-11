// Copy of the 2026 redesign: the home page and the three service pages, one module per language
// (en.ts, cs.ts). Typed here instead of a content collection while the design is still a proposal.

export type ServiceKey = "ai" | "software" | "security";

/** A sample deliverable shown as a document: an agent's permissions, a release report, a test finding. */
export type Sheet = {
  /** What the reader is looking at, e.g. "Example of a finding from a test report" */
  caption: string;
  title: string;
  /** Severity of a security finding; drawn in the redline colour */
  severity?: string;
  rows: [label: string, value: string][];
};

export type Question = { q: string; a: string };
export type Step = { title: string; text: string };

export type Block =
  | { kind: "compare"; title: string; lead: string; columns: { title: string; text: string; rows: [string, string][]; fit: string }[] }
  | { kind: "points"; title: string; lead?: string; items: { title: string; text: string }[] }
  | { kind: "prose"; title: string; text: string[] };

export type Service = {
  key: ServiceKey;
  path: string;
  /** Short name: navigation, footer, the home page index */
  name: string;
  metadata: { title: string; description: string };
  title: string;
  lead: string;
  sheet: Sheet;
  /** The home page index row */
  summary: string;
  offers: { title: string; items: { title: string; text: string; points: string[] }[] };
  blocks: Block[];
  steps: { title: string; lead?: string; items: Step[] };
  questions: Question[];
  contact: { title: string; lead: string; mailSubject: string };
};

export type Site = {
  skipLink: string;
  nav: { label: string; home: string; work: string; process: string; contact: string; cta: string; open: string; close: string };
  langSwitch: { label: string; title: string };
  home: {
    metadata: { title: string; description: string };
    hero: {
      /** One sentence per line */
      title: [string, string];
      lead: string;
      primary: string;
      secondary: string;
    };
    system: {
      caption: string;
      /** Five stages, left to right. A `marked` node is one our security team attacks first; the stage's
          `note` says how, and stands under that stage. */
      stages: { name: string; nodes: { label: string; marked?: boolean }[]; note?: string }[];
    };
    services: { id: string; title: string };
    why: { title: string; items: { title: string; text: string }[] };
    work: {
      id: string;
      title: string;
      lead: string;
      columns: [string, string, string];
      agents: { name: string; text: string; meta: string }[];
      facts: string[];
    };
    questions: { id: string; title: string; items: Question[] };
    process: { id: string; title: string; lead: string; steps: Step[] };
    contact: { id: string; title: string; lead: string; mailSubject: string };
  };
  services: Service[];
  shared: {
    sample: string;
    questionsTitle: string;
    otherServices: string;
    saveContact: string;
    emailLabel: string;
    phoneLabel: string;
  };
  footer: {
    tagline: string;
    servicesLabel: string;
    companyLabel: string;
    contactLabel: string;
    privacy: string;
    operatedBy: string;
    seatLabel: string;
    idLabel: string;
    registry: string;
  };
};
