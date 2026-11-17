import { CASE, CONTROL, CTA_DIAGNOSTICS, CTA_ESTIMATE, CTA_SECURITY, DEPLOYMENT, LADDER, Q, STARTERS } from "./cs-offer";
import type { Site } from "./types";

// České texty webu. Pozicování (listopad 2026): sivak.ai zefektivňuje středně velké výrobní firmy; prodáváme
// výsledek, ne technologii. Fakta o agentech, nasazení, kontrole a případu softwarové firmy vycházejí ze
// schválených textů původního webu. Žádná jména klientů ani vymyšlená čísla; jediná cena na webu je
// AI diagnostika (cs-offer.ts). Stránky mimo tři služby jsou v pages.ts.
// Pevné mezery za jednopísmennými předložkami doplní web sám (src/lib/czech.ts).
export const cs: Site = {
  skipLink: "Přeskočit na obsah",
  nav: {
    label: "Hlavní navigace",
    home: "sivak.ai – úvod",
    work: "Z praxe",
    process: "Jak pracujeme",
    contact: "Kontakt",
    cta: "Odhad návratnosti zdarma",
    open: "Otevřít menu",
    close: "Zavřít menu",
  },
  langSwitch: { label: "English", title: "Switch to English" },
  // Hlavní menu bez vývoje softwaru; ten a AI školení jsou dostupné z patičky
  menu: {
    main: [
      { href: "/ai-pro-vyrobni-firmy", label: "AI pro výrobní firmy" },
      { href: "/jak-pracujeme", label: "Jak pracujeme" },
      { href: "/vysledky", label: "Výsledky" },
      { href: "/bezpecnost", label: "Bezpečnost" },
      { href: "/o-nas", label: "O nás" },
    ],
    footerServices: [
      { href: "/ai-pro-vyrobni-firmy", label: "AI pro výrobní firmy" },
      { href: "/jak-pracujeme", label: "AI diagnostika a pilot" },
      { href: "/bezpecnost", label: "Bezpečnostní prověrka" },
      { href: "/ai-skoleni", label: "Workshopy a AI školení" },
      { href: "/ai-reseni", label: "AI řešení" },
      { href: "/vyvoj-softwaru", label: "Vývoj softwaru" },
    ],
    footerCompany: [
      { href: "/vysledky", label: "Výsledky" },
      { href: "/jak-pracujeme", label: "Jak pracujeme" },
      { href: "/o-nas", label: "Proč sivak.ai" },
    ],
  },
  home: {
    metadata: {
      title: "AI agenti pro výrobní firmy: návratnost předem | sivak.ai",
      description:
        "Zefektivňujeme středně velké výrobní firmy. Najdeme práci, která zbytečně žere lidi a peníze, a nasadíme na ni AI agenty, které provozujeme a hlídáme.",
    },
    hero: {
      title: ["AI řešení, která vydělávají peníze.", "A která nikdo nezneužije."],
      lead: "Pro středně velké výrobní firmy. Najdeme jeden proces s nejrychlejší návratností, postavíme na něj agenta a ručíme za jeho provoz i bezpečnost.",
      primary: CTA_DIAGNOSTICS.label,
      secondary: CTA_ESTIMATE.label,
      cta: [CTA_DIAGNOSTICS, CTA_ESTIMATE],
    },
    system: {
      caption: "Typické nasazení agenta ve výrobní firmě. Červeně jsou místa, kde náš bezpečnostní tým zaútočí nejdřív.",
      stages: [
        { name: "Lidé", nodes: [{ label: "Obchod a účtárna" }, { label: "Zákazníci a dodavatelé" }] },
        { name: "Vstupy", nodes: [{ label: "E-mail a PDF", marked: true }, { label: "Excel" }], note: "Pokyny ukryté v příchozím e-mailu" },
        { name: "AI agenti", nodes: [{ label: "Agent připraví práci", marked: true }, { label: "Člověk schválí" }], note: "Agent s širším přístupem, než ke své práci potřebuje" },
        { name: "Firemní systémy", nodes: [{ label: "ERP", marked: true }, { label: "Dokumenty a data" }], note: "Staré rozhraní bez ochrany přihlášením" },
        { name: "AI modely", nodes: [{ label: "V cloudu" }, { label: "Na vašem hardwaru" }] },
      ],
    },
    services: {
      id: "sluzby",
      title: "Tři nabídky, kterými začínáme",
      lead: "Každá míří na práci, kterou výrobní firmy dělají ručně v e-mailu, PDF a Excelu. Každá má jasný výstup.",
      items: STARTERS.map((item) => ({ ...item, href: "/ai-pro-vyrobni-firmy#startovni-nabidky" })),
      link: { href: "/ai-pro-vyrobni-firmy", label: "AI pro výrobní firmy" },
    },
    why: {
      title: "Proč sivak.ai",
      items: [
        {
          title: "Bez návratnosti nestavíme",
          text: "Návratnost spočítáme dřív, než začneme. Když nevychází, řekneme vám to a nestavíme.",
        },
        {
          title: "Agent připraví, člověk rozhodne",
          text: "Důležité kroky schvaluje váš člověk. Každá akce agenta je zaznamenaná, takže víte, co udělal a proč.",
        },
        {
          title: "Stavíme i útočíme v jednom týmu",
          text: "Lidé, kteří agenty stavějí, sedí vedle lidí, kteří systémy napadají. Slabá místa odstraníme před nasazením, ne po incidentu.",
        },
        {
          title: "Provozujeme a hlídáme",
          text: "Agenta vám nepředáme a neodejdeme. Provozujeme ho v cloudu, nebo na vašem vlastním hardwaru, a za provoz ručíme.",
        },
      ],
    },
    work: {
      id: "z-praxe",
      title: "Z praxe: tým AI agentů v softwarové firmě",
      lead: "Pro softwarovou firmu provozujeme agenty, kteří každý den pracují vedle lidí z podpory, testování a vývoje.",
      columns: CASE.columns,
      agents: CASE.agents,
      facts: CASE.facts,
      link: { href: "/vysledky", label: "Výsledky a případové studie" },
    },
    questions: {
      id: "otazky",
      title: "Na co se firmy ptají, než začneme",
      items: [
        Q.price,
        Q.noReturn,
        Q.systems,
        Q.mistake,
        Q.where,
        Q.access,
        {
          q: "Jak rychle uvidíme výsledek?",
          a: "Začínáme jedním procesem, kde se práce vrátí nejrychleji. Pilot trvá 4–8 týdnů a od prvního dne provozu měříme odvedenou práci a ušetřený čas.",
        },
        {
          q: "Pro jaké firmy pracujete?",
          a: "Zaměřujeme se na výrobní a výrobně-obchodní firmy s 50 až 500 lidmi, které jedou na ERP a hodně práce dělají v e-mailu, PDF a Excelu. Pokud řešíte podobnou rutinu v jiném oboru, ozvěte se: odhad návratnosti probíhá stejně.",
        },
      ],
    },
    process: {
      id: "postup",
      title: "Jak pracujeme",
      lead: "Čtyři fáze. Na konci každé se rozhodujete vy, jestli pokračovat. Bez návratnosti nestavíme.",
      steps: LADDER,
      from: 0,
      link: { href: "/jak-pracujeme", label: "Co v každé fázi dostanete" },
    },
    contact: {
      id: "kontakt",
      title: "Zjistěte, kolik vám mizí v rutinní práci",
      lead: "Odhad návratnosti je zdarma: 45minutový hovor a jednostránkový odhad. Pokud už víte, který proces chcete řešit, objednejte rovnou AI diagnostiku.",
      mailSubject: CTA_DIAGNOSTICS.subject,
      cta: [CTA_DIAGNOSTICS, CTA_ESTIMATE],
    },
  },
  services: [
    {
      key: "ai",
      path: "/ai-reseni",
      name: "AI řešení",
      metadata: {
        title: "AI řešení pro firmy: agenti a nástroje | sivak.ai",
        description:
          "AI agenti, AI nad firemními daty, automatizace procesů a roboti pro starý software. V cloudu i na vašem hardwaru. Agent připraví, člověk rozhodne.",
      },
      title: "AI agenti, kteří ve vašich systémech odvedou skutečnou práci",
      lead: "Stavíme agenty na míru vašim procesům. Čtou e-maily a dokumenty, vyplňují formuláře, pracují ve vašem ERP a hotovou práci předají člověku ke schválení.",
      summary: "Agenti a nástroje, které ve vašich systémech odvedou jasně danou práci. Agent připraví, člověk rozhodne.",
      sheet: {
        caption: "Ukázka oprávnění agenta",
        title: "Agent: fakturace",
        rows: [
          ["E-mail faktury@", "Čtení"],
          ["Účetní systém", "Čtení, návrh zápisu"],
          ["Banka", "Čtení"],
          ["Schvaluje", "Účetní"],
          ["Hesla", "Spravuje systém"],
          ["Záznam", "Každý krok"],
        ],
      },
      offers: {
        title: "Co stavíme",
        items: [
          {
            title: "AI agenti v týmu",
            text: "Digitální kolegové na konkrétní práci. Vyřizují požadavky, kontrolují dokumenty a testují software.",
            points: ["Zákaznická podpora", "Kontrola dokumentů", "Testování aplikací"],
          },
          {
            title: "AI nad vašimi daty",
            text: "Napojíme AI na ERP, CRM i tabulky. Zeptáte se běžnou větou a dostanete odpověď s čísly.",
            points: ["Přehledy pro vedení", "Hledání ve smlouvách", "Upozornění na odchylky"],
          },
          {
            title: "Automatizace procesů",
            text: "Propojíme systémy, které spolu nemluví. Data se přenesou sama, bez přepisování z jednoho okna do druhého.",
            points: ["Z e-mailu do ERP", "Z e-shopu do účetnictví", "Z CRM do fakturace"],
          },
          {
            title: "Roboti pro starý software",
            text: "Obsluhují programy bez API: starší ERP systémy, DOSové aplikace i interní systémy, které nikdo nechce přepisovat.",
            points: ["Práce přes obrazovku", "Bez zásahu do systému", "Ve dne i v noci"],
          },
        ],
      },
      blocks: [DEPLOYMENT, CONTROL],
      steps: {
        title: "Od odhadu k agentovi v provozu",
        lead: "Čtyři fáze. Na konci každé se rozhodujete vy, jestli pokračovat. Bez návratnosti nestavíme.",
        from: 0,
        items: LADDER,
      },
      questions: [
        Q.systems,
        Q.mistake,
        Q.price,
        { q: "Jak rychle uvidíme výsledek?", a: "Začínáme procesem, kde se agent zaplatí nejrychleji. Od prvního dne provozu měříme, kolik práce odvedl a kolik času ušetřil." },
        { q: "Jsou naše data v bezpečí?", a: "Agent má přístup jen k tomu, co ke své práci potřebuje, většinou jen ke čtení. Hesla nevidí a zkouší na kopii dat, ne v ostrém provozu." },
        { q: "Musí agent běžet v cloudu?", a: "Nemusí. Agenty stavíme v cloudu i na vašem vlastním hardwaru s lokálními modely, které fungují i bez přístupu k internetu. Data pak nikdy neopustí firmu." },
      ],
      contact: {
        title: "Ukažte nám práci, která vás zdržuje",
        lead: "Odhad návratnosti je zdarma: v 45minutovém hovoru projdeme váš proces a pošleme jednostránkový odhad, kde se agent zaplatí nejrychleji.",
        mailSubject: CTA_ESTIMATE.subject,
      },
    },
    {
      key: "software",
      path: "/vyvoj-softwaru",
      name: "Vývoj softwaru",
      metadata: {
        title: "Vývoj softwaru na míru pro firmy | sivak.ai",
        description:
          "Webové aplikace, interní systémy, propojení systémů a modernizace starého softwaru. Krátké verze, každou před schválením člověkem otestujeme a zkontrolujeme.",
      },
      title: "Software na míru pro systémy, na kterých vaše firma stojí",
      lead: "Navrhujeme, vyvíjíme a provozujeme aplikace, interní systémy a propojení. Každou verzi otestujeme ve skutečném prohlížeči a zkontrolujeme, než ji člověk schválí.",
      summary: "Aplikace na míru, interní systémy a propojení. Dodáváme po krátkých verzích a každou před nasazením otestujeme.",
      sheet: {
        caption: "Ukázka zprávy o vydání",
        title: "Verze 4.12",
        rows: [
          ["Zadání a změny v kódu", "Zkontrolováno 6 kritérií"],
          ["Test ve skutečném prohlížeči", "Prošlo 6 z 6"],
          ["Doklady", "Video a snímky obrazovky uloženy"],
          ["Kontrola kódu", "Nezávislá, schváleno"],
          ["Bezpečnostní kontrola", "Žádný otevřený nález"],
          ["Nasazení", "Schválil člověk"],
        ],
      },
      offers: {
        title: "Co stavíme",
        items: [
          {
            title: "Webové aplikace a portály",
            text: "Aplikace, které každý den používají vaši zákazníci, partneři i zaměstnanci, na počítači i v telefonu.",
            points: ["Zákaznické portály", "Objednávkové systémy", "Aplikace pro lidi v terénu"],
          },
          {
            title: "Interní systémy",
            text: "Nástroje postavené pro váš proces tam, kde běžný software nestačí.",
            points: ["Plánování a evidence", "Schvalování", "Přehledy pro vedení"],
          },
          {
            title: "Propojení systémů",
            text: "Propojíme systémy, které spolu nemluví. Data se přenesou sama, bez přepisování.",
            points: ["ERP a CRM", "Účetnictví", "E-shop a sklad"],
          },
          {
            title: "Modernizace starého softwaru",
            text: "Systémy, na které nikdo nechce sáhnout, nahradíme nebo rozšíříme krok za krokem a za plného provozu.",
            points: ["Postupná náhrada", "Převod dat", "Bez zastavení provozu"],
          },
        ],
      },
      blocks: [
        {
          kind: "points",
          title: "Jak dodáváme",
          items: [
            { title: "Krátké verze", text: "Fungující software vidíte brzy a často, ne až při jedné velké dodávce na konci." },
            { title: "Test před každým nasazením", text: "Naši vlastní AI agenti vyzkouší každou verzi ve skutečném prohlížeči jako tester a uloží video jako doklad." },
            { title: "Nezávislá kontrola kódu", text: "Každá změna v kódu projde nezávislou kontrolou. Schvaluje a nasazuje ji člověk." },
            { title: "Prověřeno útočníky", text: "Náš bezpečnostní tým otestuje, co postavíme, dřív než to spustíme." },
          ],
        },
      ],
      steps: {
        title: "Jak probíhá softwarový projekt",
        items: [
          { title: "Seznámení", text: "Zmapujeme proces, uživatele a systémy, se kterými musí software pracovat." },
          { title: "Rozsah a odhad", text: "Než začneme, dostanete písemný rozsah, plán verzí a odhad." },
          { title: "Vývoj a testy", text: "Dodáváme po krátkých verzích. Každou otestujeme, zkontrolujeme a schválí ji člověk." },
          { title: "Provoz a rozvoj", text: "Software provozujeme, hlídáme a dál rozvíjíme podle toho, jak se vaše firma mění." },
        ],
      },
      questions: [
        { q: "Převezmete software od jiného dodavatele?", a: "Ano. Začneme kontrolou kódu a provozu. Potom navrhneme, co ponechat, opravit, nebo nahradit." },
        { q: "Spolupracujete s naším interním IT?", a: "Ano. Dodáme celý projekt, nebo pracujeme jako součást vašeho týmu." },
        { q: "Musí software obsahovat AI?", a: "Nemusí. AI používáme tam, kde ušetří práci. Mnoha systémům stačí dobrý a spolehlivý software." },
        { q: "Kde software poběží?", a: "V cloudu, nebo na vašich vlastních serverech. Rozhodnete vy." },
      ],
      contact: {
        title: "Řekněte nám, co vaše systémy dnes neumějí",
        lead: "Na první schůzce projdeme váš proces a systémy a navrhneme první verzi.",
        mailSubject: "Schůzka: vývoj softwaru",
        cta: "Domluvit schůzku",
      },
    },
    {
      key: "security",
      path: "/bezpecnost",
      name: "Bezpečnost",
      metadata: {
        title: "Bezpečnostní prověrka firmy a AI agentů | sivak.ai",
        description:
          "Jeden vážný únik dat může firmu položit. Bezpečnostní prověrka, penetrační testy a dohled: ukážeme, kam by se útočník dostal, a pomůžeme ho zastavit.",
      },
      title: "Jeden vážný únik dat může firmu vaší velikosti položit",
      lead: "Stojící výroba, zašifrované ERP, ceníky a výkresy zákazníků venku. Na vaše systémy a AI agenty zaútočíme dřív než někdo jiný, ukážeme, kam by se útočník dostal, a pomůžeme mu cestu zavřít.",
      summary: "Na vaše systémy a AI agenty zaútočíme stejně jako skutečný útočník. Ukážeme, co by to znamenalo pro provoz, a pomůžeme slabá místa odstranit.",
      sheet: {
        caption: "Ukázka nálezu ze zprávy z testu",
        title: "F-03 Agent plní pokyny ukryté v e-mailu",
        severity: "Vysoká",
        rows: [
          ["Cíl", "Agent pro příjem objednávek, sdílená schránka"],
          ["Útok", "Příchozí e-mail obsahuje ukryté pokyny. Agent je přečte jako zadání."],
          ["Dopad na firmu", "Ceníky a údaje zákazníků z ERP mohou opustit firmu"],
          ["Oprava", "Brát obsah e-mailu jako data, omezit přístup agenta do ERP, schvalovat odchozí poštu"],
          ["Opakovaný test", "Po opravě prošel"],
        ],
      },
      offers: {
        title: "S čím pomůžeme",
        items: [
          {
            title: "Bezpečnostní prověrka",
            text: "Druhé vstupní dveře ke spolupráci. V dohodnutém rozsahu zjistíme, kam by se útočník ve vaší firmě dostal a co by to znamenalo pro výrobu, data a zákazníky.",
            points: ["Zpráva srozumitelná pro vedení", "Nálezy podle dopadu na provoz", "Návrh oprav"],
          },
          {
            title: "Penetrační testy",
            text: "Hledáme slabiny, kterými se dá dostat k vašim datům nebo zastavit provoz, a ukážeme, kam až vedou.",
            points: ["Webové a mobilní aplikace", "API", "Sítě a cloud"],
          },
          {
            title: "Simulovaný útok",
            text: "Red teaming: útok na celou firmu, tedy na lidi, procesy i technologie. Ukáže, jestli by někdo z vašich lidí útočníka pustil dál. Vždy s písemným souhlasem vedení.",
            points: ["Phishing a vishing", "AI phishing", "Deepfake hovor jen s výslovným souhlasem"],
          },
          {
            title: "Prověrka AI a agentů",
            text: "Zmapujeme AI nástroje a agenty ve firmě včetně těch, o kterých vedení neví, jejich přístup k datům a rizika zneužití. Výstupem je písemná zpráva a prezentace pro vedení.",
            points: ["Shadow AI", "Oprávnění a dodavatelé", "Prompt injection"],
          },
          {
            title: "Opravy",
            text: "Zprávou nekončíme. Slabiny opravíme, nastavíme pravidla přístupu a doplníme kontroly pro AI agenty s lidským schvalováním.",
            points: ["Opravy a opakované testy", "Pravidla přístupu", "Pravidla používání AI"],
          },
          {
            title: "Průběžný dohled",
            text: "Vaše systémy se mění každý týden. Hlídáme je, po změnách testy opakujeme a hlásíme nová rizika.",
            points: ["Opakované testy", "Sledování změn", "Pravidelné zprávy"],
          },
        ],
      },
      blocks: [
        {
          kind: "prose",
          title: "Co firmu stojí jeden incident",
          text: [
            "Útok dnes neznamená jen ztracená data. Znamená stojící výrobu, nevyřízené objednávky a telefonáty zákazníkům, jejichž dokumentace unikla.",
            "Velká firma má na takový týden rezervy a vlastní bezpečnostní tým. Středně velká výrobní firma většinou ne. Proto se vyplatí znát svá slabá místa dřív, než je najde někdo jiný.",
          ],
        },
        {
          kind: "prose",
          title: "AI agenti jsou nové dveře do firmy",
          text: [
            "Útočníci s AI snadno vytvoří přesvědčivé zprávy, napodobí hlas i video a podvrženým obsahem ovlivní vašeho agenta. Rizikem jsou také interní data v nástrojích, které nikdo neschválil.",
            "AI agenty sami stavíme a provozujeme. Víme, jaká oprávnění dostávají, jaká data čtou a jak je může ovlivnit podvržený obsah. Proto u agentů a chatbotů testujeme prompt injection, únik dat a příliš široká oprávnění. Stavíme i útočíme v jednom týmu.",
          ],
        },
        {
          kind: "prose",
          title: "Evropská regulace",
          text: [
            "NIS2 a AI Act jsou součástí evropské regulace. Pomůžeme s podklady pro řízení rizik AI a transparentnost podle vaší situace. Neposkytujeme právní poradenství; posouzení konkrétních povinností patří advokátovi.",
          ],
        },
      ],
      steps: {
        title: "Jak prověrka probíhá",
        items: [
          { title: "Úvodní rozhovor", text: "Co provozujete, jak používáte AI a co by firmu bolelo nejvíc, kdyby to uniklo nebo přestalo fungovat." },
          { title: "Rozsah a souhlas", text: "Dohodneme cíle, hranice a písemný souhlas vedení." },
          { title: "Test", text: "Testujeme v dohodnutém rozsahu a práci plánujeme tak, aby nenarušila provoz." },
          { title: "Zpráva a oprava", text: "Nálezy podle dopadu na firmu, prezentace pro vedení a po dohodě pomoc s opravami." },
        ],
      },
      questions: [
        { q: "Je simulovaný útok bezpečný?", a: "Předem dohodneme cíle, hranice testu a způsob vyhodnocení. Simulace probíhá vždy v dohodnutém rozsahu a s písemným souhlasem vedení. Hlasový deepfake vyžaduje výslovný souhlas; výsledky sdílíme důvěrně." },
        { q: "Testujete AI agenty a chatboty?", a: "Ano: prompt injection, únik dat a příliš široká oprávnění." },
        { q: "Testujete i systémy od jiného dodavatele?", a: "Ano. Testujeme aplikace, sítě i AI systémy bez ohledu na to, kdo je postavil." },
        { q: "Pomůžete s NIS2 a AI Actem?", a: "Pomůžeme s podklady pro řízení rizik nástrojů a dodavatelů a s interními pravidly. Konkrétní právní povinnosti doporučujeme posoudit s advokátem." },
        { q: "Nahradíte naše IT nebo bezpečnostní firmu?", a: "Měnit je nemusíte. Pracujeme vedle vašeho IT a stávajících dodavatelů a nálezy jim předáme." },
      ],
      contact: {
        title: "Zjistěte, co by u vás našel útočník",
        lead: "Řekněte nám, co potřebujete chránit. Navrhneme rozsah bezpečnostní prověrky.",
        mailSubject: CTA_SECURITY.subject,
        cta: CTA_SECURITY.label,
      },
    },
  ],
  shared: {
    sample: "Ilustrační ukázka",
    questionsTitle: "Na co se nás firmy ptají",
    otherServices: "Naše další služby",
    saveContact: "Uložit kontakt",
    emailLabel: "E-mail",
    phoneLabel: "Telefon",
  },
  footer: {
    tagline: "AI agenti pro středně velké výrobní firmy. Návratnost spočítáme předem, agenty provozujeme a hlídáme.",
    servicesLabel: "Služby",
    companyLabel: "Firma",
    contactLabel: "Kontakt",
    privacy: "Ochrana osobních údajů",
    operatedBy: "sivak.ai provozuje",
    seatLabel: "se sídlem",
    idLabel: "IČO",
    registry: "Zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 98925.",
  },
};
