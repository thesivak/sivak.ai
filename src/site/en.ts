import type { Site } from "./types";

// English copy of the redesign. Facts about agents, deployment, controls and the software-company case
// come from the approved copy of the earlier site. No prices, client names or figures.
export const en: Site = {
  skipLink: "Skip to content",
  nav: {
    label: "Main navigation",
    home: "sivak.ai, home",
    work: "Our work",
    process: "How we work",
    contact: "Contact",
    cta: "Book a meeting",
    open: "Open menu",
    close: "Close menu",
  },
  langSwitch: { label: "Česky", title: "Přepnout do češtiny" },
  home: {
    metadata: {
      title: "AI systems, software and security for companies | sivak.ai",
      description:
        "We build AI agents and custom software for companies, and we test their security: penetration tests, red teaming and continuous monitoring.",
    },
    hero: {
      title: ["We build AI systems and software.", "Then we try to break them."],
      lead: "sivak.ai is one team for AI solutions, software development and security. We build systems that do real work and resist a real attack.",
      primary: "Book a meeting",
      secondary: "See what we do",
    },
    system: {
      caption: "A typical system we build. Red shows where our security team attacks first.",
      stages: [
        { name: "People", nodes: [{ label: "Employees" }, { label: "Customers" }] },
        { name: "Applications", nodes: [{ label: "Web and mobile apps" }, { label: "Email and chat", marked: true }], note: "Instructions hidden in an incoming email" },
        { name: "AI agents", nodes: [{ label: "Agent prepares the work", marked: true }, { label: "A person approves" }], note: "An agent with wider access than its job needs" },
        { name: "Company systems", nodes: [{ label: "ERP and CRM", marked: true }, { label: "Documents and data" }], note: "An old interface with no login protection" },
        { name: "AI models", nodes: [{ label: "In the cloud" }, { label: "On your hardware" }] },
      ],
    },
    services: { id: "services", title: "What we do" },
    why: {
      title: "Why one team for all three",
      items: [
        {
          title: "Security starts in the design",
          text: "The people who build your system sit next to the people who attack systems. Weak points are removed before the first release, not after an incident.",
        },
        {
          title: "A finding gets fixed",
          text: "A test report alone changes nothing. The team that finds a weakness can also repair it and test it again.",
        },
        {
          title: "We know AI from the inside",
          text: "We build AI agents ourselves. We know which permissions they get, which data they read and how planted content can steer them.",
        },
      ],
    },
    work: {
      id: "case-study",
      title: "In operation: a team of AI agents at a software company",
      lead: "For a software company, we run agents that work every day alongside the people in support, testing and development.",
      columns: ["Agent", "What it does", "How it runs"],
      agents: [
        {
          name: "Customer support",
          text: "Investigates every new request. Reads the customer's history, checks the data in the app and drafts a reply. A person sends it.",
          meta: "Checks for new requests every 10 minutes",
        },
        {
          name: "Testing",
          text: "Tries each new release in a real browser, the way a tester would. Backs up the result with screenshots and video.",
          meta: "Verdict: pass, fail or blocked",
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
    },
    questions: {
      id: "faq",
      title: "What companies ask before they start",
      items: [
        {
          q: "Do we need to change our systems?",
          a: "No. An agent works in the applications you already use. Where there is no integration, it operates the program through the screen, just like a person.",
        },
        {
          q: "Where does the AI run?",
          a: "In the cloud or on your own hardware. If data must not leave the company, we deploy local models on your server. They work without internet access.",
        },
        {
          q: "What if an agent makes a mistake?",
          a: "The agent prepares, a person decides. Important steps are always approved by a person, and every action is recorded, so you know what the agent did and why.",
        },
        {
          q: "What can an agent access?",
          a: "Only what its job requires, usually read-only. It never sees passwords, and it tries things out on a copy of your data, not in live operations.",
        },
        {
          q: "Do you test systems that another supplier built?",
          a: "Yes. We test applications, networks and AI systems, whoever built them.",
        },
        {
          q: "Is a simulated attack safe?",
          a: "We agree on goals, test boundaries and evaluation in advance. A simulation always takes place within an agreed scope and with written consent from management. Results are shared confidentially.",
        },
        {
          q: "How soon will we see results?",
          a: "We start with one process or one system, where the work pays off fastest. From the first day of operation, we measure the work done and the time saved.",
        },
        {
          q: "What kinds of companies do you work with?",
          a: "Companies of any size in manufacturing, trade, services and software. The industry matters less than the systems the company depends on.",
        },
      ],
    },
    process: {
      id: "process",
      title: "How a project starts",
      lead: "We start with a small step and a clear result, and expand once it has proven itself.",
      steps: [
        { title: "First meeting", text: "We go through your processes and systems and find where the work pays off fastest." },
        { title: "Scope and return", text: "We set the scope and calculate the return: hours saved or risks removed. You know it before we start." },
        { title: "Pilot or first test", text: "We build one agent, deliver the first release or run the first test. Your people review the result." },
        { title: "Operation", text: "We run, monitor and improve what we delivered. Security tests repeat as the system changes." },
      ],
    },
    contact: {
      id: "contact",
      title: "Tell us what you need built or tested",
      lead: "In the first meeting, we go through your situation and propose the first step.",
      mailSubject: "Meeting: sivak.ai",
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
      title: "AI agents and tools that do real work in your systems",
      lead: "We build agents around your processes. They read emails and documents, fill in forms, work in your applications and hand the finished work to a person for approval.",
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
      blocks: [
        {
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
        },
        {
          kind: "points",
          title: "The agent prepares. A person decides.",
          lead: "Agents work within clear limits. You always know what they do, what they can access and how they reached a result.",
          items: [
            { title: "A person approves", text: "Important steps, such as replying to a customer, posting an entry or placing an order, are always confirmed by a person." },
            { title: "Only the access it needs", text: "An agent gets access only to what its job requires. Usually read-only." },
            { title: "No passwords", text: "Credentials are managed by the system. The agent never gets its hands on them." },
            { title: "Trials on a copy", text: "It tests and tries things out on a copy of your data. Live operations stay untouched." },
            { title: "Every step recorded", text: "Every action is logged, including screenshots and video. You know what the agent did and why." },
            { title: "Measurable results", text: "You see how much work the agent has done and how much time it has saved you." },
          ],
        },
      ],
      steps: {
        title: "From the first meeting to an agent at work",
        lead: "We start with a small step and a clear result, and expand once the agent has proven itself.",
        items: [
          { title: "Intro meeting", text: "We go through your processes and find the routine that takes up the most time." },
          { title: "Return estimate", text: "We calculate how many hours the agent will save and when the investment pays back. You know before we start." },
          { title: "Pilot project", text: "We build an agent for one process. Your people review its work while we measure the results." },
          { title: "Operation and growth", text: "We run, monitor and improve the agent. Once it proves itself, it takes on more work." },
        ],
      },
      questions: [
        { q: "Do we need to change our systems?", a: "No. The agent works in the applications you already use. Where there's no integration, it operates the program through the screen, just like a person." },
        { q: "What if the agent makes a mistake?", a: "The agent prepares, a person decides. Important steps are always approved by a person, and every action is recorded, so you know what the agent did and why." },
        { q: "How soon will we see results?", a: "We start with the process where an agent pays off fastest. From the first day of operation, we measure how much work it does and how much time it saves." },
        { q: "Is our data safe?", a: "The agent only gets access to what its job requires, usually read-only. It never sees passwords and tries things out on a copy of your data, not in live operations." },
        { q: "Does the agent have to run in the cloud?", a: "No. We build agents in the cloud and on your own hardware with local models that work without internet access. Your data then never leaves the company." },
      ],
      contact: {
        title: "Show us the work that slows you down",
        lead: "In the first meeting, we'll go through your processes and show you where an agent pays off fastest.",
        mailSubject: "Meeting: AI solutions for our company",
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
      },
    },
    {
      key: "security",
      path: "/en/security",
      name: "Security",
      metadata: {
        title: "Penetration tests, red teaming and AI security | sivak.ai",
        description:
          "Penetration tests, red teaming, security analysis and continuous monitoring for applications, networks and AI. Proof of what an attacker can do.",
      },
      title: "We attack your systems before someone else does",
      lead: "Penetration tests, red teaming and continuous monitoring for applications, networks and AI. You get proof of what an attacker can do, and help to stop it.",
      summary: "We attack your applications, networks and AI the way a real attacker would. Then we help you close the gaps.",
      sheet: {
        caption: "Example of a finding from a test report",
        title: "F-03 Agent follows instructions hidden in an email",
        severity: "High",
        rows: [
          ["Target", "Support agent, shared inbox"],
          ["Attack", "An incoming email carries hidden instructions. The agent reads them as a task."],
          ["Impact", "Customer records from the CRM can leave the company"],
          ["Fix", "Treat email content as data, limit the agent's CRM access, approve outgoing mail"],
          ["Retest", "Passed after the fix"],
        ],
      },
      offers: {
        title: "What we do",
        items: [
          {
            title: "Penetration tests",
            text: "We look for weaknesses an attacker can use, within an agreed scope, and show how far they lead.",
            points: ["Web and mobile applications", "APIs", "Networks and cloud"],
          },
          {
            title: "Red teaming",
            text: "A simulated attack on the whole company: people, processes and technology. Always with written consent from management.",
            points: ["Phishing and vishing", "AI phishing", "Deepfake calls only with explicit consent"],
          },
          {
            title: "Security analysis",
            text: "We map your systems, AI tools and agents, including shadow AI, their data access and the risks of misuse. You receive a written report and a presentation for management.",
            points: ["Shadow AI", "Permissions and suppliers", "Prompt injection"],
          },
          {
            title: "Security solutions",
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
          title: "AI gave attackers new tools",
          text: [
            "Attackers use AI to create convincing messages, imitate voices and video, and manipulate your agents with injected content. Internal and personal data in unapproved tools are another risk.",
            "We build AI agents ourselves. In practice, we deal with their permissions, their data access and their exposure to untrusted content. That is why we test AI agents and chatbots for prompt injection, data leakage and overly broad permissions.",
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
        title: "How a test runs",
        items: [
          { title: "Initial conversation", text: "What you run, how you use AI and what you need to protect." },
          { title: "Scope and consent", text: "We agree on goals, boundaries and written consent from management." },
          { title: "Test", text: "We test within the agreed scope and plan the work to avoid disrupting operations." },
          { title: "Report and repair", text: "Prioritised findings, a presentation for management and help with the fixes where agreed." },
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
        lead: "Tell us what you need to protect. We will propose the scope of the first test.",
        mailSubject: "Security enquiry",
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
    tagline: "AI solutions, software development and security for companies.",
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
