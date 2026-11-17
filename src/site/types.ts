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
export type Link = { href: string; label: string };
/** A call to action that opens an e-mail with the enquiry type as its subject (meetingHref in src/lib/site.ts). */
export type Cta = { label: string; subject: string };
/** A row of an index: a named offer, what it is and what the client gets. */
export type IndexItem = { title: string; href?: string; text: string; points: string[] };

export type Block =
  | { kind: "compare"; title: string; lead: string; columns: { title: string; text: string; rows: [string, string][]; fit: string }[] }
  | { kind: "points"; title: string; lead?: string; items: { title: string; text: string }[] }
  | { kind: "prose"; title: string; text: string[]; link?: Link };

/** A section of a content page (src/site/pages.ts): the blocks of a service page and the home page's sections. */
export type Section = { id?: string } & (
  | Block
  /** Typical situations in the words a client would use: illustrations, never quotes of a real client */
  | { kind: "voices"; title: string; lead?: string; items: string[] }
  | { kind: "index"; title: string; lead?: string; items: IndexItem[]; link?: Link }
  | { kind: "steps"; title: string; lead?: string; from?: number; items: Step[] }
  | { kind: "work"; title: string; lead: string; columns: [string, string, string]; rows: { name: string; text: string; meta: string }[]; facts: string[] }
  | { kind: "questions"; title: string; items: Question[] }
);

/** A page outside the three services: the industry pages, how we work, results, about. Czech only, except
    how we work (src/site/pages-en.ts). */
export type Page = {
  path: string;
  /** Short name: navigation, breadcrumb */
  name: string;
  metadata: { title: string; description: string };
  title: string;
  lead: string;
  sheet?: Sheet;
  cta: Cta[];
  sections: Section[];
  contact: { title: string; lead: string; cta: Cta[] };
};

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
  steps: { title: string; lead?: string; from?: number; items: Step[] };
  questions: Question[];
  /** `cta`: the button's wording when it is not the site-wide one (nav.cta) */
  contact: { title: string; lead: string; mailSubject: string; cta?: string };
};

export type Site = {
  skipLink: string;
  nav: { label: string; home: string; work: string; process: string; contact: string; cta: string; open: string; close: string };
  langSwitch: { label: string; title: string };
  /** The header and footer links when they are not derived from the services (the Czech site) */
  /** `covers`: pages the link stands for besides its own, so it is marked as current on them too */
  menu?: { main: (Link & { covers?: string[] })[]; footerServices: Link[]; footerCompany: Link[] };
  home: {
    metadata: { title: string; description: string };
    hero: {
      /** One sentence per line */
      title: [string, string];
      lead: string;
      primary: string;
      secondary: string;
      /** When set, the two buttons open an enquiry e-mail instead of scrolling to a section */
      cta?: [Cta, Cta];
    };
    system: {
      caption: string;
      /** Five stages, left to right. A `marked` node is one our security team attacks first; the stage's
          `note` says how, and stands under that stage. */
      stages: { name: string; nodes: { label: string; marked?: boolean }[]; note?: string }[];
    };
    /** Who we work for: one linked row per industry page, shown under the hero (the Czech site) */
    audience?: { id: string; title: string; lead: string; items: IndexItem[] };
    /** `items`: named offers shown instead of the list of services */
    services: { id: string; title: string; lead?: string; items?: IndexItem[]; link?: Link };
    why: { title: string; items: { title: string; text: string }[] };
    /** What we do not do */
    notDoing?: { id: string; title: string; lead?: string; items: { title: string; text: string }[]; link?: Link };
    work: {
      id: string;
      title: string;
      lead: string;
      columns: [string, string, string];
      agents: { name: string; text: string; meta: string }[];
      facts: string[];
      link?: Link;
    };
    questions: { id: string; title: string; items: Question[] };
    /** `from`: the number of the first step (the Czech ladder starts at 0) */
    process: { id: string; title: string; lead: string; steps: Step[]; from?: number; link?: Link };
    contact: { id: string; title: string; lead: string; mailSubject: string; cta?: Cta[] };
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
