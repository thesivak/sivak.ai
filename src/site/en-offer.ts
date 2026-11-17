import type { Block, Cta, IndexItem, Question, Step } from "./types";

// The English offer, the twin of cs-offer.ts: what repeats on more than one English page (en.ts,
// pages-en.ts) is here once. No prices anywhere: the client gets them in the proposal.
// The industry pages, the results page and the founder's manifesto exist in Czech only, so the three
// industries and the starter offers are plain rows here, without links.

/** The site's calls to action. Each opens an e-mail with the enquiry type as its subject. */
export const CTA_DIAGNOSTICS: Cta = { label: "Order AI diagnostics", subject: "Order: AI diagnostics" };
export const CTA_ESTIMATE: Cta = { label: "Free payback estimate", subject: "Free payback estimate" };
export const CTA_SECURITY: Cta = { label: "Arrange a security review", subject: "Enquiry: security review" };

export const HOW_WE_WORK_PATH = "/en/how-we-work";

/** The name of the method for phases 0–3, as in cs-offer.ts (METHOD). */
export const METHOD = "Payback First";

/** Four phases, numbered from zero. The client decides at the end of each. */
export const LADDER: Step[] = [
  {
    title: "Payback estimate",
    text: "Free. A 45-minute call and a one-page estimate of how much work and money can be saved. Then you decide whether it makes sense to go on.",
  },
  {
    title: "AI diagnostics",
    text: "A two-day workshop: a map of the process, opportunities ranked by payback, a clickable prototype and a fixed-price proposal. If a pilot follows, we deduct the price of the diagnostics from its price.",
  },
  {
    title: "Pilot",
    text: "One process, 4–8 weeks, fixed price. We measure the result against the baseline and you decide whether the agent goes into operation.",
  },
  {
    title: "Operation",
    text: "A monthly fee for operation, monitoring, adjustments and repeated security tests. With guaranteed response times.",
  },
];
export const LADDER_LEAD = "Four phases. At the end of each one, you decide whether to continue. No payback, no build.";

/** What we don't do: four things you cannot buy from us. */
export const NOT_DOING_ID = "what-we-dont-do";
export const NOT_DOING = {
  kind: "points",
  title: "What we don't do",
  lead: "Four things you cannot buy from us. They tell you what to expect.",
  items: [
    { title: "We don't build without payback", text: "If the estimate doesn't add up, we tell you and the project doesn't start. Better to learn it from one page than after months of work." },
    { title: "We don't leave you with a prototype", text: "A demo that only works in a presentation saves no work. We take the agent into operation and keep looking after it." },
    { title: "We don't skip security", text: "An agent doesn't reach your data until our security team has tried to misuse it. Not even when you're in a hurry." },
    { title: "We don't sell tools instead of results", text: "You don't get a licence or a platform to roll out yourself. You get finished work that can be measured." },
  ],
} satisfies Block;

/** The three industries of the Czech site's "Pro koho" section; their pages are in Czech only. */
export const AUDIENCE_ID = "who-we-work-for";
export const INDUSTRIES: IndexItem[] = [
  {
    title: "Manufacturing companies",
    text: "Orders in email, quotes in Excel, invoices in PDF. Agents prepare that work right in your ERP and your people only check it.",
    points: ["Order intake into the ERP", "Quotes and small orders", "Supplier invoices"],
  },
  {
    title: "Software and SaaS companies",
    text: "Customer requests, testing before every release and small changes no one has time for. Agents work alongside your support, testers and developers.",
    points: ["Customer support triage", "Testing before a release", "Ongoing security tests"],
  },
  {
    title: "Trade and e-shops",
    text: "Orders from several channels, product data from suppliers and the same customer questions again and again. Agents prepare the groundwork, your people decide.",
    points: ["Order intake", "Product data", "Customer questions and supplier invoices"],
  },
];

/** The four starter offers of the home page, across industries; `points` is what the client gets. */
export const HOME_STARTERS: IndexItem[] = [
  {
    title: "Order intake from email into the ERP",
    text: "The agent reads an order from an email, PDF or Excel file, finds the customer and the items and prepares it in the ERP. Your person checks and confirms it.",
    points: ["Order prepared in the ERP", "Unclear points marked for review", "Confirmed by your person"],
  },
  {
    title: "Customer support agent",
    text: "The agent investigates every new request: reads the customer's history, checks the data in your systems and drafts a reply. Your person sends it.",
    points: ["Request sorted and investigated", "Drafted reply with the evidence", "Sent by your person"],
  },
  {
    title: "QA agent before every release",
    text: "The agent tries the new release in a real browser, the way a tester would, and goes through the spec point by point. It backs the result with screenshots and video.",
    points: ["Verdict: pass, fail or cannot be verified", "Screenshots and video as evidence", "A person approves the release"],
  },
  {
    title: "Supplier invoices checked against orders",
    text: "The agent compares every incoming invoice with the order and the goods receipt in the ERP. Matching ones are prepared for posting; differences in price or quantity go to the accountant with an explanation.",
    points: ["Invoices matched to orders", "A list of differences to decide on", "The accountant approves posting"],
  },
];

/** The one case study the site publishes: anonymous, in approved wording only. */
export const CASE = {
  columns: ["Agent", "What it does", "How it runs"] as [string, string, string],
  agents: [
    {
      name: "Customer support",
      text: "Investigates every new request. Reads the customer's history, checks the data in the app and drafts a reply. A person sends it.",
      meta: "Checks for new requests every 10 minutes",
    },
    {
      name: "Testing",
      text: "Tries each new release in a real browser, the way a tester would. Backs up the result with screenshots and video.",
      meta: "Verdict: pass, fail or cannot be verified",
    },
    {
      name: "Development and code review",
      text: "Prepares code changes from the spec, and an independent agent reviews them. A person approves and deploys.",
      meta: "Away from live operations",
    },
    {
      name: "Studio for colleagues",
      text: "Colleagues who don't code describe an idea and see it in the app right away. They hand developers a finished proposal.",
      meta: "From idea to proposal, no coding",
    },
  ],
  facts: ["Read-only access to company systems", "Every step recorded", "Runs day and night"],
};

export const CONTROL: Block = {
  kind: "points",
  title: "The agent prepares. A person decides.",
  lead: "Agents work within clear limits. You always know what they do, what they can access and how they reached a result.",
  items: [
    { title: "A person approves", text: "Important steps, such as confirming an order, posting an invoice or replying to a customer, are always confirmed by a person." },
    { title: "Only the access it needs", text: "An agent gets access only to what its job requires. Usually read-only." },
    { title: "No passwords", text: "Credentials are managed by the system. The agent never gets its hands on them." },
    { title: "Trials on a copy", text: "It tests and tries things out on a copy of your data. Live operations stay untouched." },
    { title: "Every step recorded", text: "Every action is logged, including screenshots and video. You know what the agent did and why." },
    { title: "Measurable results", text: "You see how much work the agent has done and how much time it has saved you." },
  ],
};

export const DEPLOYMENT: Block = {
  kind: "compare",
  title: "In the cloud or on your own hardware",
  lead: "You decide where your agents run. If data must not leave the company, we deploy them on your own server with local AI models, which work with no internet access at all.",
  columns: [
    {
      title: "Cloud",
      text: "Agents use the most capable AI models in the cloud. You need no hardware of your own, so you start sooner.",
      rows: [
        ["Model", "Most capable cloud models"],
        ["Hardware", "None needed"],
        ["Start", "Fastest"],
      ],
      fit: "For a fast start and top performance.",
    },
    {
      title: "Your own hardware",
      text: "Agents and AI models run on a server in your company. Data never leaves your network, and everything works without internet access.",
      rows: [
        ["Model", "Local, runs on site"],
        ["Data", "Never leaves the company"],
        ["Internet", "Not needed"],
      ],
      fit: "For sensitive data, manufacturing and closed networks.",
    },
  ],
};

/** Questions that repeat on more than one page. */
export const Q = {
  systems: {
    q: "Do we need to change our systems for the agents?",
    a: "No. An agent works in the systems you already use. Where there is no integration, it operates the program through the screen, just like a person.",
  },
  mistake: {
    q: "What if an agent makes a mistake?",
    a: "The agent prepares, a person decides. Important steps are always approved by a person, and every action is recorded, so you know what the agent did and why.",
  },
  where: {
    q: "Where does the AI run?",
    a: "In the cloud or on your own hardware. If data must not leave the company, we deploy local models on your server. They work without internet access.",
  },
  access: {
    q: "What can an agent access?",
    a: "Only what its job requires, usually read-only. It never sees passwords, and it tries things out on a copy of your data, not in live operations.",
  },
  price: {
    q: "How much does it cost?",
    a: "The payback estimate is free. AI diagnostics has a fixed price you know in advance, and if a pilot follows, we deduct it from the pilot's price. You get the fixed price of the pilot and the monthly operating fee in the proposal at the end of the diagnostics.",
  },
  who: {
    q: "What kinds of companies do you work with?",
    a: "Companies of roughly 20 to 500 people, where the owner or management decides and a lot of time is lost to routine work: orders, quotes, invoices, customer support, testing. The industry doesn't decide; how much time routine takes does.",
  },
  noReturn: {
    q: "What if the payback doesn't add up?",
    a: "We tell you and we don't build. No payback, no build: it is better to learn that from a one-page estimate than after six months of work.",
  },
} satisfies Record<string, Question>;
