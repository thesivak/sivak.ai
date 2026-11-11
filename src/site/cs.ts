import type { Site } from "./types";

// České texty redesignu. Fakta o agentech, nasazení, kontrole a případu softwarové firmy vycházejí ze
// schválených textů původního webu. Žádné ceny, jména klientů ani čísla.
// Pevné mezery za jednopísmennými předložkami doplní web sám (src/lib/czech.ts).
export const cs: Site = {
  skipLink: "Přeskočit na obsah",
  nav: {
    label: "Hlavní navigace",
    home: "sivak.ai – úvod",
    work: "Z praxe",
    process: "Jak pracujeme",
    contact: "Kontakt",
    cta: "Domluvit schůzku",
    open: "Otevřít menu",
    close: "Zavřít menu",
  },
  langSwitch: { label: "English", title: "Switch to English" },
  home: {
    metadata: {
      title: "AI systémy, software a bezpečnost pro firmy | sivak.ai",
      description:
        "Stavíme AI agenty a software na míru pro firmy a testujeme jejich bezpečnost: penetrační testy, red teaming a nepřetržitý dohled.",
    },
    hero: {
      title: ["Stavíme AI systémy a software.", "A pak se je snažíme prolomit."],
      lead: "sivak.ai je jeden tým pro AI řešení, vývoj softwaru a bezpečnost. Stavíme systémy, které odvedou skutečnou práci a odolají skutečnému útoku.",
      primary: "Domluvit schůzku",
      secondary: "Co děláme",
    },
    system: {
      caption: "Typický systém, jaký stavíme. Červeně jsou místa, kde náš bezpečnostní tým zaútočí nejdřív.",
      stages: [
        { name: "Lidé", nodes: [{ label: "Zaměstnanci" }, { label: "Zákazníci" }] },
        { name: "Aplikace", nodes: [{ label: "Webové a mobilní aplikace" }, { label: "E-mail a chat", marked: true }], note: "Pokyny ukryté v příchozím e-mailu" },
        { name: "AI agenti", nodes: [{ label: "Agent připraví práci", marked: true }, { label: "Člověk schválí" }], note: "Agent s širším přístupem, než ke své práci potřebuje" },
        { name: "Firemní systémy", nodes: [{ label: "ERP a CRM", marked: true }, { label: "Dokumenty a data" }], note: "Staré rozhraní bez ochrany přihlášením" },
        { name: "AI modely", nodes: [{ label: "V cloudu" }, { label: "Na vašem hardwaru" }] },
      ],
    },
    services: { id: "sluzby", title: "Co děláme" },
    why: {
      title: "Proč jeden tým na všechno",
      items: [
        {
          title: "Bezpečnost začíná návrhem",
          text: "Lidé, kteří váš systém stavějí, sedí vedle lidí, kteří systémy napadají. Slabá místa odstraníme před prvním nasazením, ne až po incidentu.",
        },
        {
          title: "Nález se opraví",
          text: "Samotná zpráva z testu nic nezmění. Tým, který slabinu najde, ji umí také opravit a znovu otestovat.",
        },
        {
          title: "AI známe zevnitř",
          text: "AI agenty sami stavíme. Víme, jaká oprávnění dostávají, jaká data čtou a jak je může ovlivnit podvržený obsah.",
        },
      ],
    },
    work: {
      id: "z-praxe",
      title: "V provozu: tým AI agentů v softwarové firmě",
      lead: "Pro softwarovou firmu provozujeme agenty, kteří každý den pracují vedle lidí z podpory, testování a vývoje.",
      columns: ["Agent", "Co dělá", "Jak běží"],
      agents: [
        {
          name: "Zákaznická podpora",
          text: "Prošetří každý nový požadavek. Přečte historii zákazníka, ověří data v aplikaci a připraví odpověď. Odesílá ji člověk.",
          meta: "Nové požadavky kontroluje každých 10 minut",
        },
        {
          name: "Testování",
          text: "Novou verzi aplikace vyzkouší ve skutečném prohlížeči jako tester. Výsledek doloží snímky obrazovky a videem.",
          meta: "Výsledek: prošlo, neprošlo, nebo nelze ověřit",
        },
        {
          name: "Vývoj a kontrola kódu",
          text: "Podle zadání připraví změnu v kódu a nezávislý agent ji zkontroluje. Schvaluje a nasazuje člověk.",
          meta: "Mimo ostrý provoz",
        },
        {
          name: "Studio pro kolegy",
          text: "Kolegové, kteří neprogramují, popíšou nápad a hned ho vidí v aplikaci. Vývojářům předají hotový návrh.",
          meta: "Od nápadu k návrhu bez programování",
        },
      ],
      facts: ["Do firemních systémů jen ke čtení", "Každý krok zaznamenaný", "Běží ve dne i v noci"],
    },
    questions: {
      id: "otazky",
      title: "Na co se firmy ptají, než začneme",
      items: [
        {
          q: "Musíme měnit své systémy?",
          a: "Ne. Agent pracuje v aplikacích, které už používáte. Kde chybí napojení, ovládá program přes obrazovku stejně jako člověk.",
        },
        {
          q: "Kde AI běží?",
          a: "V cloudu, nebo na vašem vlastním hardwaru. Pokud data nesmí opustit firmu, nasadíme lokální modely na váš server. Fungují i bez přístupu k internetu.",
        },
        {
          q: "Co když agent udělá chybu?",
          a: "Agent připraví, člověk rozhodne. Důležité kroky vždy schvaluje člověk a každá akce agenta je zaznamenaná, takže víte, co udělal a proč.",
        },
        {
          q: "K čemu má agent přístup?",
          a: "Jen k tomu, co ke své práci potřebuje, většinou jen ke čtení. Hesla nevidí a zkouší na kopii dat, ne v ostrém provozu.",
        },
        {
          q: "Testujete i systémy od jiného dodavatele?",
          a: "Ano. Testujeme aplikace, sítě i AI systémy bez ohledu na to, kdo je postavil.",
        },
        {
          q: "Je simulovaný útok bezpečný?",
          a: "Předem dohodneme cíle, hranice testu a způsob vyhodnocení. Simulace probíhá vždy v dohodnutém rozsahu a s písemným souhlasem vedení. Výsledky sdílíme důvěrně.",
        },
        {
          q: "Jak rychle uvidíme výsledek?",
          a: "Začínáme jedním procesem nebo jedním systémem, kde se práce vrátí nejrychleji. Od prvního dne provozu měříme odvedenou práci a ušetřený čas.",
        },
        {
          q: "Pro jaké firmy pracujete?",
          a: "Pro malé i velké firmy z výroby, obchodu, služeb a softwaru. Obor rozhoduje méně než systémy, na kterých firma stojí.",
        },
      ],
    },
    process: {
      id: "postup",
      title: "Jak spolupráce začíná",
      lead: "Začínáme malým krokem s jasným výsledkem. Rozšiřujeme, až když se osvědčí.",
      steps: [
        { title: "První schůzka", text: "Projdeme vaše procesy a systémy a najdeme, kde se práce vrátí nejrychleji." },
        { title: "Rozsah a návratnost", text: "Určíme rozsah a spočítáme návratnost: ušetřené hodiny nebo odstraněná rizika. Víte to dřív, než začneme." },
        { title: "Pilot nebo první test", text: "Postavíme jednoho agenta, dodáme první verzi nebo provedeme první test. Výsledek zkontrolují vaši lidé." },
        { title: "Provoz", text: "Dodané řešení provozujeme, hlídáme a zlepšujeme. Bezpečnostní testy opakujeme, když se systém změní." },
      ],
    },
    contact: {
      id: "kontakt",
      title: "Řekněte nám, co potřebujete postavit nebo otestovat",
      lead: "Na první schůzce projdeme vaši situaci a navrhneme první krok.",
      mailSubject: "Schůzka: sivak.ai",
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
      title: "AI agenti a nástroje, které ve vašich systémech odvedou skutečnou práci",
      lead: "Stavíme agenty na míru vašim procesům. Čtou e-maily a dokumenty, vyplňují formuláře, pracují ve vašich aplikacích a hotovou práci předají člověku ke schválení.",
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
      blocks: [
        {
          kind: "compare",
          title: "V cloudu i na vašem hardwaru",
          lead: "Kde agenti poběží, rozhodnete vy. Pokud data nesmí opustit firmu, nasadíme je na váš server s lokálními AI modely. Fungují i úplně bez přístupu k internetu.",
          columns: [
            {
              title: "Cloud",
              text: "Agenti využívají nejvýkonnější AI modely v cloudu. Nepotřebujete vlastní hardware, takže začnete rychleji.",
              rows: [
                ["Model", "Nejvýkonnější cloudové modely"],
                ["Hardware", "Není potřeba"],
                ["Start", "Nejrychlejší"],
              ],
              fit: "Pro rychlý start a nejvyšší výkon.",
            },
            {
              title: "Váš vlastní hardware",
              text: "Agenti i AI modely běží na serveru ve vaší firmě. Data nikdy neopustí vaši síť a vše funguje i bez přístupu k internetu.",
              rows: [
                ["Model", "Lokální, běží u vás"],
                ["Data", "Neopustí firmu"],
                ["Internet", "Není potřeba"],
              ],
              fit: "Pro citlivá data, výrobu a uzavřené sítě.",
            },
          ],
        },
        {
          kind: "points",
          title: "Agent připraví. Člověk rozhodne.",
          lead: "Agenti pracují v jasných mantinelech. Vždy víte, co dělají, k čemu mají přístup a proč došli k výsledku.",
          items: [
            { title: "Schvaluje člověk", text: "Důležité kroky, jako odpověď zákazníkovi, zaúčtování nebo objednávku, vždy potvrdí člověk." },
            { title: "Jen nutná oprávnění", text: "Agent dostane přístup jen k tomu, co ke své práci potřebuje. Většinou jen ke čtení." },
            { title: "Hesla nevidí", text: "Přístupové údaje spravuje systém. Agent je nikdy nedostane do rukou." },
            { title: "Zkouší na kopii", text: "Testuje a zkouší na kopii dat. Ostrý provoz zůstává nedotčený." },
            { title: "Záznam každého kroku", text: "Každá akce je zaznamenaná, včetně snímků obrazovky a videa. Víte, co agent udělal a proč." },
            { title: "Měřitelný výsledek", text: "Vidíte, kolik práce agent odvedl a kolik času vám ušetřil." },
          ],
        },
      ],
      steps: {
        title: "Od první schůzky k agentovi v provozu",
        lead: "Začínáme malým krokem s jasným výsledkem. Rozšiřujeme, až když se agent osvědčí.",
        items: [
          { title: "Úvodní schůzka", text: "Projdeme vaše procesy a najdeme rutinu, která zabírá nejvíc času." },
          { title: "Výpočet návratnosti", text: "Spočítáme, kolik hodin agent ušetří a kdy se investice vrátí. Víte to dřív, než začneme." },
          { title: "Pilotní projekt", text: "Postavíme agenta na jeden proces. Vaši lidé kontrolují jeho práci a my měříme výsledky." },
          { title: "Provoz a rozšíření", text: "Agenta provozujeme, hlídáme a zlepšujeme. Když se osvědčí, převezme další práci." },
        ],
      },
      questions: [
        { q: "Musíme kvůli agentům měnit své systémy?", a: "Ne. Agent pracuje v aplikacích, které už používáte. Kde chybí napojení, ovládá program přes obrazovku stejně jako člověk." },
        { q: "Co když agent udělá chybu?", a: "Agent připraví, člověk rozhodne. Důležité kroky vždy schvaluje člověk a každá akce agenta je zaznamenaná, takže víte, co udělal a proč." },
        { q: "Jak rychle uvidíme výsledek?", a: "Začínáme procesem, kde se agent zaplatí nejrychleji. Od prvního dne provozu měříme, kolik práce odvedl a kolik času ušetřil." },
        { q: "Jsou naše data v bezpečí?", a: "Agent má přístup jen k tomu, co ke své práci potřebuje, většinou jen ke čtení. Hesla nevidí a zkouší na kopii dat, ne v ostrém provozu." },
        { q: "Musí agent běžet v cloudu?", a: "Nemusí. Agenty stavíme v cloudu i na vašem vlastním hardwaru s lokálními modely, které fungují i bez přístupu k internetu. Data pak nikdy neopustí firmu." },
      ],
      contact: {
        title: "Ukažte nám práci, která vás zdržuje",
        lead: "Na první schůzce projdeme vaše procesy a ukážeme, kde se agent zaplatí nejrychleji.",
        mailSubject: "Schůzka: AI řešení pro naši firmu",
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
      },
    },
    {
      key: "security",
      path: "/bezpecnost",
      name: "Bezpečnost",
      metadata: {
        title: "Penetrační testy, red teaming a AI bezpečnost | sivak.ai",
        description:
          "Penetrační testy, red teaming, bezpečnostní analýza a nepřetržitý dohled pro aplikace, sítě a AI. Doložíme, co útočník dokáže, a pomůžeme ho zastavit.",
      },
      title: "Na vaše systémy zaútočíme dřív než někdo jiný",
      lead: "Penetrační testy, red teaming a nepřetržitý dohled pro aplikace, sítě a AI. Doložíme, co útočník dokáže, a pomůžeme ho zastavit.",
      summary: "Na vaše aplikace, sítě a AI zaútočíme stejně jako skutečný útočník. Potom pomůžeme slabá místa odstranit.",
      sheet: {
        caption: "Ukázka nálezu ze zprávy z testu",
        title: "F-03 Agent plní pokyny ukryté v e-mailu",
        severity: "Vysoká",
        rows: [
          ["Cíl", "Agent podpory, sdílená schránka"],
          ["Útok", "Příchozí e-mail obsahuje ukryté pokyny. Agent je přečte jako zadání."],
          ["Dopad", "Záznamy zákazníků z CRM mohou opustit firmu"],
          ["Oprava", "Brát obsah e-mailu jako data, omezit přístup agenta do CRM, schvalovat odchozí poštu"],
          ["Opakovaný test", "Po opravě prošel"],
        ],
      },
      offers: {
        title: "Co děláme",
        items: [
          {
            title: "Penetrační testy",
            text: "V dohodnutém rozsahu hledáme slabiny, které může útočník využít, a ukážeme, kam až vedou.",
            points: ["Webové a mobilní aplikace", "API", "Sítě a cloud"],
          },
          {
            title: "Red teaming",
            text: "Simulovaný útok na celou firmu: lidi, procesy i technologie. Vždy s písemným souhlasem vedení.",
            points: ["Phishing a vishing", "AI phishing", "Deepfake hovor jen s výslovným souhlasem"],
          },
          {
            title: "Bezpečnostní analýza",
            text: "Zmapujeme vaše systémy, AI nástroje a agenty včetně shadow AI, jejich přístup k datům a rizika zneužití. Výstupem je písemná zpráva a prezentace pro vedení.",
            points: ["Shadow AI", "Oprávnění a dodavatelé", "Prompt injection"],
          },
          {
            title: "Bezpečnostní řešení",
            text: "Zprávou nekončíme. Slabiny opravíme, nastavíme pravidla přístupu a doplníme kontroly pro AI agenty s lidským schvalováním.",
            points: ["Opravy a opakované testy", "Pravidla přístupu", "Pravidla používání AI"],
          },
          {
            title: "Nepřetržitý dohled",
            text: "Vaše systémy se mění každý týden. Hlídáme je, po změnách testy opakujeme a hlásíme nová rizika.",
            points: ["Opakované testy", "Sledování změn", "Pravidelné zprávy"],
          },
        ],
      },
      blocks: [
        {
          kind: "prose",
          title: "AI dala útočníkům nové nástroje",
          text: [
            "Útočníci s AI snadno vytvoří přesvědčivé zprávy, napodobí hlas i video a podvrženým obsahem ovlivní vašeho agenta. Rizikem jsou také interní a osobní data v neschválených nástrojích.",
            "AI agenty sami stavíme. V praxi řešíme, jaká oprávnění dostávají, jaká data čtou a jak je může ovlivnit podvržený obsah. Proto u AI agentů a chatbotů testujeme prompt injection, únik dat a příliš široká oprávnění.",
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
        title: "Jak test probíhá",
        items: [
          { title: "Úvodní rozhovor", text: "Co provozujete, jak používáte AI a co potřebujete chránit." },
          { title: "Rozsah a souhlas", text: "Dohodneme cíle, hranice a písemný souhlas vedení." },
          { title: "Test", text: "Testujeme v dohodnutém rozsahu a práci plánujeme tak, aby nenarušila provoz." },
          { title: "Zpráva a oprava", text: "Nálezy podle priority, prezentace pro vedení a po dohodě pomoc s opravami." },
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
        lead: "Řekněte nám, co potřebujete chránit. Navrhneme rozsah prvního testu.",
        mailSubject: "Poptávka: bezpečnost",
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
    tagline: "AI řešení, vývoj softwaru a bezpečnost pro firmy.",
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
