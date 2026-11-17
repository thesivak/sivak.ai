import {
  AUDIENCE_ID,
  CASE,
  CONTROL,
  CTA_DIAGNOSTICS,
  CTA_ESTIMATE,
  CTA_SECURITY,
  DEPLOYMENT,
  GUARANTEE,
  GUARANTEE_ID,
  HOME_STARTERS,
  HOW_WE_WORK_PATH,
  INDUSTRIES,
  LADDER,
  LADDER_LEAD,
  METHOD,
  NOT_DOING,
  NOT_DOING_ID,
  PROMISE,
  Q,
  RESULT,
  RESULT_ID,
} from "./en-offer";
import type { Site } from "./types";

// English copy, the twin of cs.ts. Positioning (November 2026) as on the Czech site: by problem, not by
// industry. sivak.ai works for mid-sized companies that lose a lot of time to routine work; we sell a
// result, not a technology. Facts about agents, deployment, controls and the software-company case come
// from the approved copy of the earlier site. No prices, client names or made-up figures (en-offer.ts).
// The industry pages, results and the founder's manifesto are in Czech only; "how we work" is in pages-en.ts.
export const en: Site = {
  skipLink: "Skip to content",
  nav: {
    label: "Main navigation",
    home: "sivak.ai, home",
    work: "Our work",
    process: "How we work",
    contact: "Contact",
    cta: CTA_ESTIMATE.label,
    open: "Open menu",
    close: "Close menu",
  },
  langSwitch: { label: "Česky", title: "Přepnout do češtiny" },
  // The main menu without software development, as in Czech; it stays reachable from the footer
  menu: {
    main: [
      { href: `/en#${AUDIENCE_ID}`, label: "Who we work for" },
      { href: HOW_WE_WORK_PATH, label: "How we work" },
      { href: "/en/ai-solutions", label: "AI solutions" },
      { href: "/en/security", label: "Security" },
      { href: "/en#contact", label: "Contact" },
    ],
    footerServices: [
      { href: HOW_WE_WORK_PATH, label: "AI diagnostics and pilot" },
      { href: "/en/security", label: "Security review" },
      { href: "/en/ai-solutions", label: "AI solutions" },
      { href: "/en/software-development", label: "Software development" },
    ],
    footerCompany: [
      { href: "/en#case-study", label: "Our work" },
      { href: HOW_WE_WORK_PATH, label: "How we work" },
    ],
  },
  home: {
    metadata: {
      title: "AI agents for routine work: payback first | sivak.ai",
      description:
        "For mid-sized companies where routine eats people's time: orders, quotes, invoices, support, testing. We deploy AI agents that we run and watch over.",
    },
    hero: {
      title: ["AI solutions that make money.", "And that no one can misuse."],
      lead: "For mid-sized companies where routine eats people's time. We find the one process with the fastest payback, build an agent for it and stand behind its operation and security.",
      // UKÁZKA – potvrdí Mirek: unconfirmed deadline, shown with the preview tag
      promise: { text: PROMISE, preview: true },
      primary: CTA_DIAGNOSTICS.label,
      secondary: CTA_ESTIMATE.label,
      cta: [CTA_DIAGNOSTICS, CTA_ESTIMATE],
    },
    system: {
      caption: "A typical agent deployment in a mid-sized company. Red shows where our security team attacks first.",
      stages: [
        { name: "People", nodes: [{ label: "Sales, support and accounting" }, { label: "Customers and suppliers" }] },
        { name: "Inputs", nodes: [{ label: "Email and PDF", marked: true }, { label: "Customer requests" }], note: "Instructions hidden in an incoming email" },
        { name: "AI agents", nodes: [{ label: "Agent prepares the work", marked: true }, { label: "A person approves" }], note: "An agent with wider access than its job needs" },
        { name: "Company systems", nodes: [{ label: "ERP and internal applications", marked: true }, { label: "Documents and data" }], note: "An old interface with no login protection" },
        { name: "AI models", nodes: [{ label: "In the cloud" }, { label: "On your hardware" }] },
      ],
    },
    audience: {
      id: AUDIENCE_ID,
      title: "Who we work for",
      lead: "Mid-sized companies where a lot of time is lost to routine work: orders, quotes, invoices, customer support, testing. Roughly 20 to 500 people, where the owner or management decides.",
      items: INDUSTRIES,
    },
    services: {
      id: "services",
      title: "Four offers we start with",
      lead: "Each one targets routine that repeats every day and can be measured. Each has a clear deliverable.",
      items: HOME_STARTERS,
      link: { href: HOW_WE_WORK_PATH, label: "How we work: from estimate to operation" },
    },
    why: {
      title: "Why sivak.ai",
      items: [
        {
          title: "No payback, no build",
          text: "We calculate the payback before we start. If it doesn't add up, we tell you and we don't build.",
        },
        {
          title: "The agent prepares, a person decides",
          text: "Your person approves the important steps. Every action of the agent is recorded, so you know what it did and why.",
        },
        {
          title: "We build and attack in one team",
          text: "The people who build agents sit next to the people who attack systems. Weak points are removed before launch, not after an incident.",
        },
        {
          title: "We run it and watch over it",
          text: "We don't hand the agent over and leave. We run it in the cloud or on your own hardware, and we stand behind its operation.",
        },
      ],
    },
    // UKÁZKA – potvrdí Mirek: a stand-in result with no figure, shown with the preview tag
    result: { id: RESULT_ID, ...RESULT, preview: true },
    notDoing: { id: NOT_DOING_ID, title: NOT_DOING.title, lead: NOT_DOING.lead, items: NOT_DOING.items },
    work: {
      id: "case-study",
      title: "In operation: a team of AI agents at a software company",
      lead: "For a software company, we run agents that work every day alongside the people in support, testing and development.",
      columns: CASE.columns,
      agents: CASE.agents,
      facts: CASE.facts,
    },
    questions: {
      id: "faq",
      title: "What companies ask before we start",
      items: [
        Q.price,
        Q.noReturn,
        Q.systems,
        Q.mistake,
        Q.where,
        Q.access,
        {
          q: "How soon will we see results?",
          a: "We start with one process, where the work pays off fastest. A pilot takes 4–8 weeks, and from the first day of operation we measure the work done and the time saved.",
        },
        Q.who,
      ],
    },
    process: {
      id: "process",
      title: `How we work: the ${METHOD} method`,
      lead: LADDER_LEAD,
      steps: LADDER,
      from: 0,
      link: { href: HOW_WE_WORK_PATH, label: "What you get in each phase" },
    },
    // UKÁZKA – potvrdí Mirek: unconfirmed guarantee, shown with the preview tag; the full wording is on /en/how-we-work
    guarantee: {
      id: GUARANTEE_ID,
      title: GUARANTEE.title,
      text: [GUARANTEE.short],
      link: { href: `${HOW_WE_WORK_PATH}#${GUARANTEE_ID}`, label: "The conditions of the guarantee" },
      preview: true,
    },
    contact: {
      id: "contact",
      title: "Find out how much disappears into routine work",
      lead: "The payback estimate is free: a 45-minute call and a one-page estimate. If you already know which process you want to solve, order AI diagnostics straight away.",
      mailSubject: CTA_DIAGNOSTICS.subject,
      cta: [CTA_DIAGNOSTICS, CTA_ESTIMATE],
    },
  },
  services: [
    {
      key: "ai",
      path: "/en/ai-solutions",
      name: "AI solutions",
      metadata: {
        title: "AI solutions: agents and tools for companies | sivak.ai",
        description:
          "AI agents, AI over company data, process automation and robots for legacy software. In the cloud or on your own hardware. The agent prepares, a person decides.",
      },
      title: "AI agents that do real work in your systems",
      lead: "We build agents around your processes. They read emails and documents, fill in forms, work in your ERP and hand the finished work to a person for approval.",
      summary: "Agents and tools that do defined work in your systems. The agent prepares, a person decides.",
      sheet: {
        caption: "Example of an agent's permissions",
        title: "Agent: invoicing",
        rows: [
          ["Inbox invoices@", "Read"],
          ["Accounting system", "Read, draft entries"],
          ["Bank", "Read"],
          ["Approved by", "Accountant"],
          ["Passwords", "Managed by the system"],
          ["Log", "Every step"],
        ],
      },
      offers: {
        title: "What we build",
        items: [
          {
            title: "AI agents on your team",
            text: "Digital colleagues for specific jobs. They handle requests, check documents and test software.",
            points: ["Customer support", "Document checks", "Application testing"],
          },
          {
            title: "AI over your company data",
            text: "We connect AI to your ERP, CRM and spreadsheets. Ask in plain language and get answers backed by numbers.",
            points: ["Management reports", "Contract search", "Deviation alerts"],
          },
          {
            title: "Process automation",
            text: "We connect systems that don't talk to each other. Data moves on its own, with no retyping from one window to another.",
            points: ["Email to ERP", "E-shop to accounting", "CRM to invoicing"],
          },
          {
            title: "Robots for legacy software",
            text: "They operate programs with no API: older ERP systems, DOS applications and in-house systems no one wants to rewrite.",
            points: ["Works through the screen", "No changes to the system", "Day and night"],
          },
        ],
      },
      blocks: [DEPLOYMENT, CONTROL],
      steps: {
        title: "From the estimate to an agent in operation",
        lead: LADDER_LEAD,
        from: 0,
        items: LADDER,
      },
      questions: [
        Q.systems,
        Q.mistake,
        Q.price,
        { q: "How soon will we see results?", a: "We start with the process where an agent pays off fastest. From the first day of operation, we measure how much work it does and how much time it saves." },
        { q: "Is our data safe?", a: "The agent only gets access to what its job requires, usually read-only. It never sees passwords and tries things out on a copy of your data, not in live operations." },
        { q: "Does the agent have to run in the cloud?", a: "No. We build agents in the cloud and on your own hardware with local models that work without internet access. Your data then never leaves the company." },
      ],
      contact: {
        title: "Show us the work that slows you down",
        lead: "The payback estimate is free: in a 45-minute call we go through your process and send a one-page estimate of where an agent pays off fastest.",
        mailSubject: CTA_ESTIMATE.subject,
      },
    },
    {
      key: "software",
      path: "/en/software-development",
      name: "Software development",
      metadata: {
        title: "Custom software development for companies | sivak.ai",
        description:
          "Web applications, internal systems, integrations and modernisation of old software. Short releases, each one tested and reviewed before a person approves it.",
      },
      title: "Custom software for the systems your company runs on",
      lead: "We design, build and operate applications, internal systems and integrations. Each release is tested in a real browser and reviewed before a person approves it.",
      summary: "Custom applications, internal systems and integrations. Built in short releases, each one tested before launch.",
      sheet: {
        caption: "Example of a release report",
        title: "Release 4.12",
        rows: [
          ["Spec and code changes", "6 criteria reviewed"],
          ["Test in a real browser", "6 of 6 passed"],
          ["Evidence", "Video and screenshots saved"],
          ["Code review", "Independent, approved"],
          ["Security check", "No open findings"],
          ["Deployment", "Approved by a person"],
        ],
      },
      offers: {
        title: "What we build",
        items: [
          {
            title: "Web applications and portals",
            text: "Applications your customers, partners and employees use every day, on a computer and on a phone.",
            points: ["Customer portals", "Ordering systems", "Applications for field teams"],
          },
          {
            title: "Internal systems",
            text: "Tools built for your process where standard software does not fit.",
            points: ["Planning and records", "Approvals", "Reports for management"],
          },
          {
            title: "Integrations",
            text: "We connect systems that don't talk to each other. Data moves on its own, with no retyping.",
            points: ["ERP and CRM", "Accounting", "E-shop and warehouse"],
          },
          {
            title: "Modernisation of old software",
            text: "We replace or extend systems no one wants to touch, step by step, while operations continue.",
            points: ["Step-by-step replacement", "Data migration", "No stop in operations"],
          },
        ],
      },
      blocks: [
        {
          kind: "points",
          title: "How we deliver",
          items: [
            { title: "Short releases", text: "You see working software early and often, not one large delivery at the end." },
            { title: "Tested before each launch", text: "Our own AI agents try each release in a real browser, the way a tester would, and save video as evidence." },
            { title: "Independent code review", text: "Each code change is reviewed independently. A person approves and deploys it." },
            { title: "Checked by attackers", text: "Our security team tests what we build before it goes live." },
          ],
        },
      ],
      steps: {
        title: "How a software project runs",
        items: [
          { title: "Discovery", text: "We map the process, the users and the systems the software must work with." },
          { title: "Scope and estimate", text: "You get a written scope, a plan of releases and an estimate before we start." },
          { title: "Build and test", text: "We deliver in short releases. Each one is tested, reviewed and approved by a person." },
          { title: "Operation and growth", text: "We run and monitor the software and develop it further as your company changes." },
        ],
      },
      questions: [
        { q: "Can you take over software that another supplier built?", a: "Yes. We start with a review of the code and the operation, then propose what to keep, fix or replace." },
        { q: "Do you work with our internal IT team?", a: "Yes. We can deliver the whole project or work as part of your team." },
        { q: "Does the software need AI?", a: "No. We use AI where it saves work. Many systems only need good, reliable software." },
        { q: "Where does the software run?", a: "In the cloud or on your own servers. You decide." },
      ],
      contact: {
        title: "Tell us what your systems cannot do today",
        lead: "In the first meeting, we go through your process and systems and propose the first release.",
        mailSubject: "Meeting: software development",
        cta: "Book a meeting",
      },
    },
    {
      key: "security",
      path: "/en/security",
      name: "Security",
      metadata: {
        title: "Security review of your company and AI agents | sivak.ai",
        description:
          "One serious data leak can bring a company down. Security review, penetration tests and monitoring: we show how far an attacker would get and help stop them.",
      },
      title: "One serious data leak can bring a company your size down",
      lead: "Operations at a standstill, systems encrypted, customer data out in the open. We attack your systems and AI agents before someone else does, show how far an attacker would get and help close the way.",
      summary: "We attack your systems and AI agents the way a real attacker would. We show what it would mean for your operations and help remove the weak points.",
      sheet: {
        caption: "Example of a finding from a test report",
        title: "F-03 Agent follows instructions hidden in an email",
        severity: "High",
        rows: [
          ["Target", "Order intake agent, shared inbox"],
          ["Attack", "An incoming email carries hidden instructions. The agent reads them as a task."],
          ["Business impact", "Price lists and customer data from the ERP can leave the company"],
          ["Fix", "Treat email content as data, limit the agent's ERP access, approve outgoing mail"],
          ["Retest", "Passed after the fix"],
        ],
      },
      offers: {
        title: "How we help",
        items: [
          {
            title: "Security review",
            text: "The second way in to working with us. Within an agreed scope, we find out how far an attacker would get in your company and what that would mean for operations, data and customers.",
            points: ["A report management can read", "Findings by impact on operations", "Proposed fixes"],
          },
          {
            title: "Penetration tests",
            text: "We look for weaknesses that lead to your data or can stop your operations, and show how far they reach.",
            points: ["Web and mobile applications", "APIs", "Networks and cloud"],
          },
          {
            title: "Simulated attack",
            text: "Red teaming: an attack on the whole company, meaning people, processes and technology. It shows whether one of your people would let an attacker further in. Always with written consent from management.",
            points: ["Phishing and vishing", "AI phishing", "Deepfake calls only with explicit consent"],
          },
          {
            title: "Review of AI and agents",
            text: "We map the AI tools and agents in the company, including those management doesn't know about, their data access and the risks of misuse. You receive a written report and a presentation for management.",
            points: ["Shadow AI", "Permissions and suppliers", "Prompt injection"],
          },
          {
            title: "Fixes",
            text: "We do not stop at the report. We repair weaknesses, set access rules and add controls for AI agents with human approval.",
            points: ["Fixes and retests", "Access rules", "AI usage policy"],
          },
          {
            title: "Continuous monitoring",
            text: "Your systems change every week. We keep watch, repeat tests after changes and report new risks.",
            points: ["Repeated tests", "Watch on changes", "Regular reports"],
          },
        ],
      },
      blocks: [
        {
          kind: "prose",
          title: "What one incident costs a company",
          text: [
            "An attack today is not only lost data. It is operations at a standstill, orders left unprocessed and phone calls to customers whose documents leaked.",
            "A large company has reserves for a week like that, and its own security team. A mid-sized company usually doesn't. That is why it pays to know your weak points before someone else finds them.",
          ],
        },
        {
          kind: "prose",
          title: "AI agents are a new door into the company",
          text: [
            "Attackers use AI to create convincing messages, imitate voices and video, and steer your agent with planted content. Internal data in tools nobody approved is another risk.",
            "We build and run AI agents ourselves. We know which permissions they get, which data they read and how planted content can steer them. That is why we test agents and chatbots for prompt injection, data leakage and overly broad permissions. We build and attack in one team.",
          ],
        },
        {
          kind: "prose",
          title: "European regulation",
          text: [
            "NIS2 and the AI Act are part of European regulation. We help prepare AI risk management and transparency documentation for your situation. We do not provide legal advice; a lawyer should assess your specific obligations.",
          ],
        },
      ],
      steps: {
        title: "How a review runs",
        items: [
          { title: "Initial conversation", text: "What you run, how you use AI and what would hurt the company most if it leaked or stopped working." },
          { title: "Scope and consent", text: "We agree on goals, boundaries and written consent from management." },
          { title: "Test", text: "We test within the agreed scope and plan the work to avoid disrupting operations." },
          { title: "Report and repair", text: "Findings by impact on the company, a presentation for management and help with the fixes where agreed." },
        ],
      },
      questions: [
        { q: "Is a simulated attack safe?", a: "We agree on goals, test boundaries and evaluation in advance. Simulations always take place within an agreed scope and with written consent from management. Deepfake voice calls require explicit consent; results are shared confidentially." },
        { q: "Do you test AI agents and chatbots?", a: "Yes: prompt injection, data leakage and overly broad permissions." },
        { q: "Do you test systems that another supplier built?", a: "Yes. We test applications, networks and AI systems, whoever built them." },
        { q: "Can you help with NIS2 and the AI Act?", a: "We support the documentation on tool and supplier risks and the internal policies. We recommend having a lawyer assess your specific legal obligations." },
        { q: "Will you replace our IT or security provider?", a: "You do not need to change them. We work alongside your IT team and your current providers and hand them our findings." },
      ],
      contact: {
        title: "Find out what an attacker would find",
        lead: "Tell us what you need to protect. We will propose the scope of a security review.",
        mailSubject: CTA_SECURITY.subject,
        cta: CTA_SECURITY.label,
      },
    },
  ],
  shared: {
    sample: "Illustrative example",
    questionsTitle: "What companies ask us",
    otherServices: "Our other services",
    saveContact: "Save contact",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  footer: {
    tagline: "AI agents for mid-sized companies where routine eats people's time. We calculate the payback up front, then run the agents and watch over them.",
    servicesLabel: "Services",
    companyLabel: "Company",
    contactLabel: "Contact",
    privacy: "Privacy policy (in Czech)",
    operatedBy: "sivak.ai is operated by",
    seatLabel: "registered office",
    idLabel: "Company ID",
    registry: "Registered in the Commercial Register kept by the Regional Court in Ostrava, Section C, Insert 98925.",
  },
};
