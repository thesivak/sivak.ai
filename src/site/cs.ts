import {
  AUDIENCE_ID,
  CASE,
  CONTROL,
  CTA_DIAGNOSTICS,
  CTA_ESTIMATE,
  CTA_SECURITY,
  DEPLOYMENT,
  HOME_STARTERS,
  INDUSTRIES,
  LADDER,
  METHOD,
  NOT_DOING,
  NOT_DOING_ID,
  Q,
} from "./cs-offer";
import type { Site } from "./types";

// České texty webu. Pozicování (listopad 2026): podle problému, ne podle oboru. sivak.ai pracuje pro středně
// velké firmy, kde se hodně času ztrácí v rutinní práci; prodáváme výsledek, ne technologii. Obory (výroba,
// softwarové firmy, obchod) mají své stránky v pages.ts. Fakta o agentech, nasazení, kontrole a případu
// softwarové firmy vycházejí ze schválených textů původního webu. Žádná jména klientů, vymyšlená čísla ani
// ceny (cs-offer.ts). Stránky mimo tři služby jsou v pages.ts.
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
  // Hlavní menu bez vývoje softwaru; ten je dostupný z patičky. „Pro koho“ vede na sekci
  // úvodní stránky se třemi obory a je zvýrazněné i na jejich stránkách (covers).
  menu: {
    main: [
      { href: `/#${AUDIENCE_ID}`, label: "Pro koho", covers: Object.values(INDUSTRIES).map((item) => item.href) },
      { href: "/jak-pracujeme", label: "Jak pracujeme" },
      { href: "/vysledky", label: "Výsledky" },
      { href: "/bezpecnost", label: "Bezpečnost" },
      { href: "/o-nas", label: "O nás" },
    ],
    footerServices: [
      ...Object.values(INDUSTRIES).map((item) => ({ href: item.href, label: item.title })),
      { href: "/jak-pracujeme", label: "AI diagnostika a pilot" },
      { href: "/bezpecnost", label: "Bezpečnostní prověrka" },
      { href: "/ai-reseni", label: "AI řešení" },
      { href: "/vyvoj-softwaru", label: "Software na míru" },
    ],
    footerCompany: [
      { href: "/vysledky", label: "Výsledky" },
      { href: "/jak-pracujeme", label: "Jak pracujeme" },
      { href: "/o-nas", label: "Proč sivak.ai" },
    ],
  },
  home: {
    metadata: {
      title: "AI agenti na rutinní práci: návratnost předem | sivak.ai",
      description:
        "Pro středně velké firmy, kde rutina žere čas lidí: objednávky, nabídky, faktury, podpora, testování. Nasadíme AI agenty, které provozujeme a hlídáme.",
    },
    hero: {
      title: ["AI řešení, která vydělávají peníze.", "A která nikdo nezneužije."],
      lead: "Stavíme AI agenty i software na míru. Pro středně velké firmy, kde rutina žere čas lidí. Najdeme jeden proces s nejrychlejší návratností, postavíme na něj agenta a ručíme za jeho provoz i bezpečnost.",
      primary: CTA_DIAGNOSTICS.label,
      secondary: CTA_ESTIMATE.label,
      cta: [CTA_DIAGNOSTICS, CTA_ESTIMATE],
    },
    gain: {
      id: "co-agent-udela",
      title: "Co agent udělá místo vašich lidí",
      lead: "Ukázka na jedné běžné rutině: objednávka přijde e-mailem v PDF a má skončit v ERP. Přepisování a dohledávání převezme agent. Vašemu člověku zůstane kontrola a potvrzení.",
      routine: "Objednávka z e-mailu do ERP: kdo dělá který krok",
      tag: "Ilustrační příklad: jedna objednávka z e-mailu",
      columns: ["Krok", "Dnes", "S agentem"],
      person: "Člověk",
      agent: "Agent",
      unit: "min",
      steps: [
        { task: "Přečíst e-mail a otevřít PDF s objednávkou", before: 3 },
        { task: "Dohledat zákazníka a jeho ceny", before: 6 },
        { task: "Přepsat položky do ERP", before: 13 },
        { task: "Ověřit sklad a termín dodání", before: 5 },
        { task: "Zkontrolovat a potvrdit objednávku", before: 3, after: 2 },
      ],
      total: "čas člověka na jednu objednávku",
      scale: "Při 20 objednávkách denně je to zhruba 9 hodin práce denně, kterou vaši lidé nemusí dělat ručně. Ilustrační výpočet.",
      note: "Čísla jsou ilustrační. Skutečné časy ve vaší firmě změříme v odhadu návratnosti.",
      more: {
        title: "Stejně to funguje i v jiné rutině",
        items: [
          { area: "Účtárna", input: "Faktura dodavatele v PDF", agent: "Spáruje ji s objednávkou a příjemkou v ERP a označí rozdíly.", person: "Schválí zaúčtování." },
          { area: "Zákaznická podpora", input: "Nový dotaz zákazníka", agent: "Přečte historii zákazníka, ověří data a připraví odpověď.", person: "Odpověď upraví a odešle." },
          { area: "Obchod", input: "Poptávka v e-mailu", agent: "Připraví nabídku podle ceníku a podobných zakázek.", person: "Nabídku zkontroluje a pošle." },
          { area: "E-shop", input: "Ceník od dodavatele", agent: "Doplní parametry a připraví produktové karty.", person: "Karty zveřejní." },
        ],
      },
    },
    audience: {
      id: AUDIENCE_ID,
      title: "Pro koho pracujeme",
      lead: "Pro středně velké firmy, kde se hodně času ztrácí v rutinní práci: objednávky, nabídky, faktury, zákaznická podpora, testování. Zhruba 20 až 500 lidí, rozhoduje majitel nebo vedení.",
      items: Object.values(INDUSTRIES),
    },
    pillars: {
      id: "co-delame",
      title: "Co děláme",
      lead: "Tři věci v jednom týmu: AI agenti na rutinní práci, software na míru, ve kterém AI rovnou pracuje, a bezpečnost, která obojí prověří dřív než útočník.",
    },
    services: {
      id: "sluzby",
      title: "Čtyři nabídky, kterými začínáme",
      lead: "Každá míří na rutinu, která se opakuje každý den a dá se změřit. Každá má jasný výstup.",
      items: HOME_STARTERS,
      link: { href: "/jak-pracujeme", label: "Jak pracujeme: od odhadu po provoz" },
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
    notDoing: { id: NOT_DOING_ID, title: NOT_DOING.title, lead: NOT_DOING.lead, items: NOT_DOING.items },
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
        Q.who,
      ],
    },
    process: {
      id: "postup",
      title: `Jak pracujeme: metoda ${METHOD}`,
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
      name: "Software na míru",
      metadata: {
        title: "Software na míru, ve kterém pracuje AI | sivak.ai",
        description:
          "Interní systémy, CRM, portály a napojení na ERP na míru vašemu procesu. Od zadání přes prototyp a milníky po provoz. AI tam, kde ušetří práci.",
      },
      title: "Stavíme software na míru, ve kterém AI rovnou pracuje",
      lead: "Interní systémy, CRM, portály pro zákazníky a partnery a napojení na ERP. Navrhneme je podle toho, jak vaše firma skutečně pracuje, postavíme po milnících a provozujeme dál.",
      summary: "Stavíme software na míru, ve kterém AI rovnou pracuje: interní systémy, CRM, portály a napojení na ERP. Od zadání přes prototyp po provoz.",
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
            title: "Interní systémy",
            text: "Nástroje postavené pro váš proces tam, kde krabicový software nestačí nebo vás nutí pracovat po svém.",
            points: ["Plánování a evidence", "Schvalování", "Přehledy pro vedení"],
          },
          {
            title: "CRM na míru",
            text: "Zákazníci, poptávky a zakázky v systému, který odpovídá tomu, jak skutečně prodáváte. AI v něm připraví podklady, obchodník rozhodne.",
            points: ["Zákazníci a zakázky", "Nabídky", "Historie komunikace"],
          },
          {
            title: "Portály pro zákazníky a partnery",
            text: "Objednávky, rezervace, stav zakázek a dokumenty na jednom místě, na počítači i v telefonu.",
            points: ["Zákaznické portály", "Objednávky a rezervace", "E-shopy s konfigurátorem"],
          },
          {
            title: "Napojení na ERP",
            text: "Nový software propojíme s ERP, účetnictvím a skladem. Data se přenesou sama, bez přepisování z okna do okna.",
            points: ["ERP a účetnictví", "Sklad a e-shop", "Postupná náhrada starého systému"],
          },
        ],
      },
      blocks: [
        {
          kind: "prose",
          title: "Kde v softwaru pracuje AI",
          text: [
            "AI nepřidáváme na ozdobu. Stavíme ji do míst, kde dnes člověk přepisuje, dohledává nebo porovnává: návrh nabídky v CRM, roztřídění požadavku v portálu, kontrola dokladu před zápisem do ERP.",
            "Platí stejná pravidla jako u našich agentů: AI připraví, člověk rozhodne. Má jen oprávnění, která ke své práci potřebuje, a každý její krok je zaznamenaný. Kde AI práci neušetří, nepoužijeme ji.",
          ],
          link: { href: "/ai-reseni", label: "Jak stavíme AI agenty" },
        },
        {
          kind: "compare",
          title: "Z praxe",
          lead: "Dva projekty, na kterých jsme software navrhli a postavili. Klienty nejmenujeme.",
          columns: [
            {
              title: "E-shop s konfigurátorem produktů",
              text: "Pro výrobce nábytku jsme postavili e-shop, ve kterém si zákazník produkt sestaví sám: vybere rozměry, materiál a provedení a objedná si přesně svou variantu.",
              rows: [
                ["Pro koho", "Výrobce nábytku"],
                ["Co to je", "E-shop s konfigurátorem"],
              ],
              fit: "Podobné zadání: výrobky na míru, které dnes prodáváte přes e-maily a tabulky.",
            },
            {
              title: "Platforma pro chaty a krátkodobé pronájmy",
              text: "Pro obor ubytování jsme postavili webovou platformu, na které se nabídka chat a krátkodobých pronájmů, rezervace a jejich správa potkají na jednom místě.",
              rows: [
                ["Pro koho", "Ubytování a krátkodobé pronájmy"],
                ["Co to je", "Webová platforma"],
              ],
              fit: "Podobné zadání: rezervace a správa, které dnes běží v několika oddělených nástrojích.",
            },
          ],
        },
        {
          kind: "points",
          title: "Jak dodáváme",
          items: [
            { title: "Po milnících", text: "Fungující software vidíte brzy a často, ne až při jedné velké dodávce na konci." },
            { title: "Test před každým nasazením", text: "Naši vlastní AI agenti vyzkouší každou verzi ve skutečném prohlížeči jako tester a uloží video jako doklad." },
            { title: "Nezávislá kontrola kódu", text: "Každá změna v kódu projde nezávislou kontrolou. Schvaluje a nasazuje ji člověk." },
            { title: "Prověřeno útočníky", text: "Náš bezpečnostní tým otestuje, co postavíme, dřív než to spustíme." },
          ],
        },
      ],
      steps: {
        title: "Jak probíhá softwarový projekt",
        lead: "Od zadání po provoz. Na konci každé fáze se rozhodujete vy, jestli pokračovat.",
        items: [
          { title: "Zadání", text: "Projdeme proces, lidi, kteří budou software používat, a systémy, se kterými se musí propojit. Výstupem je písemné zadání." },
          { title: "Prototyp", text: "Klikací prototyp hlavních obrazovek si vaši lidé vyzkouší dřív, než začneme stavět. Spolu s ním dostanete plán milníků a odhad." },
          { title: "Milníky", text: "Stavíme po milnících. Na konci každého vidíte fungující část systému, otestovanou a schválenou člověkem." },
          { title: "Provoz", text: "Software provozujeme, hlídáme a dál rozvíjíme podle toho, jak se vaše firma mění. V cloudu, nebo na vašich serverech." },
        ],
      },
      questions: [
        { q: "Musí software obsahovat AI?", a: "Nemusí. AI používáme tam, kde ušetří práci. Mnoha systémům stačí dobrý a spolehlivý software." },
        { q: "Nahradíte naše ERP?", a: "Většinou ne. ERP necháme a nový software na něj napojíme. Systém na míru stavíme tam, kde hotový nástroj nesedí na váš proces." },
        { q: "Převezmete software od jiného dodavatele?", a: "Ano. Začneme kontrolou kódu a provozu. Potom navrhneme, co ponechat, opravit, nebo nahradit." },
        { q: "Spolupracujete s naším interním IT?", a: "Ano. Dodáme celý projekt, nebo pracujeme jako součást vašeho týmu." },
        { q: "Kde software poběží?", a: "V cloudu, nebo na vašich vlastních serverech. Rozhodnete vy." },
        { q: "Pracujete i pro firmy mimo Česko?", a: "Ano. Projekty vedeme česky i anglicky a většina spolupráce funguje na dálku." },
      ],
      contact: {
        title: "Řekněte nám, co vaše systémy dnes neumějí",
        lead: "Na první schůzce projdeme váš proces a systémy a navrhneme, co ukáže prototyp.",
        mailSubject: "Schůzka: software na míru",
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
      lead: "Stojící provoz, zašifrované systémy, data zákazníků venku. Na vaše systémy a AI agenty zaútočíme dřív než někdo jiný, ukážeme, kam by se útočník dostal, a pomůžeme mu cestu zavřít.",
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
            text: "Druhé vstupní dveře ke spolupráci. V dohodnutém rozsahu zjistíme, kam by se útočník ve vaší firmě dostal a co by to znamenalo pro provoz, data a zákazníky.",
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
            "Útok dnes neznamená jen ztracená data. Znamená stojící provoz, nevyřízené objednávky a telefonáty zákazníkům, jejichž dokumentace unikla.",
            "Velká firma má na takový týden rezervy a vlastní bezpečnostní tým. Středně velká firma většinou ne. Proto se vyplatí znát svá slabá místa dřív, než je najde někdo jiný.",
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
    tagline: "AI agenti pro středně velké firmy, kde rutina žere čas lidí. Návratnost spočítáme předem, agenty provozujeme a hlídáme.",
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
