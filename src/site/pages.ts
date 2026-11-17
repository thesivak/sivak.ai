import { MIREK_LINKEDIN_URL } from "../lib/site";
import { CASE, CONTROL, CTA_DIAGNOSTICS, CTA_ESTIMATE, CTA_SECURITY, DEPLOYMENT, LADDER, Q, STARTERS } from "./cs-offer";
import type { Page } from "./types";

// České stránky mimo tři služby: pro koho pracujeme, jak pracujeme, výsledky a manifest zakladatele.
// Zatím jen česky (src/i18n/pages.ts → CZECH_ONLY_PAGES). Pravidla obsahu jako v cs.ts: žádná jména klientů,
// žádná vymyšlená čísla ani certifikace a žádný zástupný text: co nemáme doložené, na stránce není
// (tests/site.test.mjs).
// Pevné mezery za jednopísmennými předložkami doplní web sám (src/lib/czech.ts).
const BOTH = [CTA_DIAGNOSTICS, CTA_ESTIMATE];

export const pages = {
  manufacturing: {
    path: "/ai-pro-vyrobni-firmy",
    name: "AI pro výrobní firmy",
    metadata: {
      title: "AI pro výrobní firmy: agenti přímo ve vašem ERP | sivak.ai",
      description:
        "AI agenti pro výrobní firmy: příjem objednávek, nabídky a faktury dodavatelů přímo v ERP. Návratnost spočítáme předem, agenty provozujeme a hlídáme.",
    },
    title: "AI agenti pro výrobní firmy, kterým rutina žere lidi a peníze",
    lead: "Objednávky v e-mailu, nabídky v Excelu, faktury v PDF. Agenti tu práci připraví přímo ve vašem ERP a vaši lidé ji jen zkontrolují. Návratnost spočítáme dřív, než začneme.",
    sheet: {
      caption: "Ukázka oprávnění agenta",
      title: "Agent: příjem objednávek",
      rows: [
        ["E-mail objednavky@", "Čtení"],
        ["ERP", "Čtení, návrh objednávky"],
        ["Ceník a sklad", "Čtení"],
        ["Potvrzuje", "Obchodní referent"],
        ["Hesla", "Spravuje systém"],
        ["Záznam", "Každý krok"],
      ],
    },
    cta: BOTH,
    sections: [
      {
        kind: "points",
        id: "kde-mizi-penize",
        title: "Kde výrobním firmám mizí peníze",
        lead: "Čtyři místa, kde šikovní lidé tráví dny přepisováním a porovnáváním. Tam začínáme.",
        items: [
          { title: "Příjem objednávek", text: "Objednávky chodí e-mailem, v PDF i v Excelu. Někdo je čte a ručně přepisuje do ERP." },
          { title: "Malé objednávky", text: "Malá objednávka dá na vyřízení stejně práce jako velká. Marže se ztrácí v administrativě." },
          { title: "Nabídky", text: "Poptávka čeká, než se k ní obchodník dostane. Podklady hledá v ERP, v ceníku a ve starých nabídkách." },
          { title: "Faktury dodavatelů", text: "Účetní porovnává každou fakturu s objednávkou a příjemkou řádek po řádku." },
        ],
      },
      {
        kind: "index",
        id: "startovni-nabidky",
        title: "Tři nabídky, kterými začínáme",
        lead: "Každá má jasný výstup a každá začíná odhadem návratnosti zdarma.",
        items: STARTERS,
        link: { href: "/jak-pracujeme", label: "Jak pracujeme: od odhadu po provoz" },
      },
      {
        kind: "prose",
        id: "pro-koho",
        title: "Pro koho pracujeme",
        text: [
          "Pro české výrobní a výrobně-obchodní firmy s obratem 80 mil. až 1,5 mld. Kč a 50 až 500 lidmi, kde rozhoduje majitel nebo ředitel.",
          "Pro firmy, které jedou na ERP jako Helios, K2, ABRA, Money nebo SAP Business One a hodně práce dělají v e-mailu, PDF a Excelu.",
          "Nebavíme se s vámi o modelech a technologiích. Bavíme se o tom, kolik práce a peněz ušetříte a kdy se investice vrátí. Proto s námi obvykle jedná majitel nebo generální, finanční či provozní ředitel.",
        ],
      },
      CONTROL,
      DEPLOYMENT,
      {
        kind: "steps",
        id: "postup",
        title: "Od odhadu k agentovi v provozu",
        lead: "Čtyři fáze. Na konci každé se rozhodujete vy, jestli pokračovat. Bez návratnosti nestavíme.",
        from: 0,
        items: LADDER,
      },
      {
        kind: "questions",
        id: "otazky",
        title: "Na co se výrobní firmy ptají",
        items: [
          Q.systems,
          Q.mistake,
          Q.price,
          Q.noReturn,
          Q.where,
          {
            q: "Co budou dělat lidé, kterým agent práci vezme?",
            a: "To, na co dnes nemají čas. Agent převezme přepisování a porovnávání, lidem zůstane rozhodování, zákazníci a výjimky. Cílem je víc práce se stejným týmem.",
          },
        ],
      },
    ],
    contact: {
      title: "Ukažte nám proces, který vás stojí nejvíc",
      lead: "Odhad návratnosti je zdarma: 45minutový hovor a jednostránkový odhad. Když čísla vyjdou, navážeme AI diagnostikou.",
      cta: BOTH,
    },
  },

  process: {
    path: "/jak-pracujeme",
    name: "Jak pracujeme",
    metadata: {
      title: "Jak pracujeme: od odhadu návratnosti k provozu | sivak.ai",
      description:
        "Odhad návratnosti zdarma, AI diagnostika za pevnou cenu, pilot na jednom procesu a provoz s garantovanými reakčními dobami. Bez návratnosti nestavíme.",
    },
    title: "Bez návratnosti nestavíme",
    lead: "Spolupráce má čtyři fáze. Každá má pevný rozsah a jasný výstup a na konci každé se rozhodujete vy, jestli pokračovat.",
    sheet: {
      caption: "Ukázka jednostránkového odhadu návratnosti",
      title: "Proces: příjem objednávek z e-mailu",
      rows: [
        ["Dnes", "Ruční přepis z e-mailu a PDF do ERP"],
        ["Převezme agent", "Čtení objednávky, dohledání položek, návrh v ERP"],
        ["Zůstane lidem", "Kontrola a potvrzení"],
        ["Úspora", "Hodiny měsíčně, spočítané z vašich objemů"],
        ["Návratnost", "V měsících, proti ceně pilotu a provozu"],
        ["Doporučení", "Pokračovat AI diagnostikou"],
      ],
    },
    cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    sections: [
      {
        kind: "index",
        id: "faze",
        title: "Čtyři fáze, po každé rozhodujete vy",
        lead: "Začínáme zdarma a malým krokem. K další fázi se zavazujete, až když ta předchozí ukázala, že to dává smysl.",
        items: [
          {
            title: "0 · Odhad návratnosti",
            text: "Zdarma. V 45minutovém hovoru projdeme proces, který vás stojí nejvíc práce. Potom dostanete jednostránkový odhad. Rozhodnete se, jestli chcete diagnostiku.",
            points: ["45minutový hovor", "Jednostránkový odhad návratnosti", "Zdarma a nezávazně"],
          },
          {
            title: "1 · AI diagnostika",
            text: "Dvoudenní workshop s lidmi, kteří proces denně dělají. Má pevnou cenu, kterou znáte předem; pokud navážete pilotem, odečteme ji z jeho ceny. Rozhodnete se, jestli chcete pilot.",
            points: ["Mapa procesu", "Příležitosti seřazené podle návratnosti", "Klikací prototyp na smyšlených datech", "Nabídka s pevnou cenou"],
          },
          {
            title: "2 · Pilot",
            text: "Postavíme agenta na jeden proces. Trvá 4–8 týdnů, má pevnou cenu a výsledek měříme proti výchozímu stavu, který spolu změříme před startem. Rozhodnete se, jestli agent půjde do provozu.",
            points: ["Jeden proces", "4–8 týdnů, pevná cena", "Měřeno proti výchozímu stavu"],
          },
          {
            title: "3 · Provoz",
            text: "Agenta provozujeme, hlídáme a upravujeme, když se váš proces změní. Platíte měsíční poplatek a reakční doby máte garantované ve smlouvě. Když se osvědčí, rozhodnete, jakou práci převezme dál.",
            points: ["Provoz a monitoring", "Úpravy", "Opakované bezpečnostní testy", "Garantované reakční doby"],
          },
        ],
      },
      {
        kind: "points",
        id: "zasady",
        title: "Zásady, kterých se držíme",
        items: [
          { title: "Bez návratnosti nestavíme", text: "Návratnost spočítáme dřív, než začneme. Když nevychází, řekneme vám to a nestavíme." },
          { title: "Pevná cena předem", text: "Diagnostika i pilot mají pevnou cenu a rozsah. Víte, co dostanete a kolik zaplatíte." },
          { title: "Agent připraví, člověk rozhodne", text: "Důležité kroky schvaluje váš člověk. Každá akce agenta je zaznamenaná." },
          { title: "Stavíme i útočíme", text: "Co postavíme, otestuje náš bezpečnostní tým dřív, než to pustíme k vašim datům." },
        ],
      },
      {
        kind: "prose",
        id: "bezpecnostni-proverka",
        title: "Druhé vstupní dveře: bezpečnostní prověrka",
        text: [
          "Někdy firmu víc než rutina trápí riziko: co všechno je vidět z internetu, kdo má přístup do ERP a co by se stalo, kdyby výroba týden stála.",
          "Pak začínáme bezpečnostní prověrkou. Zjistíme, kam by se útočník dostal, a nálezy předáme vedení podle dopadu na provoz. Na AI agenty se dostane potom, na bezpečnějším základu.",
        ],
        link: { href: "/bezpecnost", label: "Bezpečnost a bezpečnostní prověrka" },
      },
      {
        kind: "prose",
        id: "workshopy",
        title: "Workshopy a AI školení",
        text: [
          "Diagnostika je workshop nad jedním procesem. Pokud chcete nejdřív naučit s AI pracovat celý tým, vedeme také jednodenní praktické AI školení pro zaměstnance i vedení.",
        ],
        link: { href: "/ai-skoleni", label: "Jednodenní AI školení pro firmy" },
      },
      {
        kind: "questions",
        id: "otazky",
        title: "Na co se firmy ptají, než začneme",
        items: [
          Q.noReturn,
          {
            q: "Proč je diagnostika placená?",
            a: `Dva dny pracujeme s vašimi lidmi a odnesete si mapu procesu, seřazené příležitosti, prototyp a nabídku s pevnou cenou. Výstupy jsou vaše, i když s námi dál nepůjdete. Pokud navážete pilotem, cenu diagnostiky odečteme z jeho ceny.`,
          },
          {
            q: "Kolik stojí pilot a provoz?",
            a: "Záleží na procesu. Pevnou cenu pilotu i měsíční poplatek za provoz dostanete v nabídce na konci diagnostiky, dřív než se k čemukoli zavážete.",
          },
          {
            q: "Co když se pilot neosvědčí?",
            a: "Výsledek měříme proti výchozímu stavu, který jsme spolu změřili před startem. Když čísla nevyjdou, do provozu nejdeme. Rozhodnutí je vaše.",
          },
          {
            q: "Kdo se má diagnostiky účastnit?",
            a: "Ten, kdo o procesu rozhoduje, a lidé, kteří ho dnes každý den dělají. Vaše IT přizveme, až půjde o napojení na systémy.",
          },
          Q.systems,
        ],
      },
    ],
    contact: {
      title: "Začněte odhadem návratnosti",
      lead: "Je zdarma a k ničemu vás nezavazuje: 45minutový hovor a jednostránkový odhad. Pokud už víte, který proces chcete řešit, objednejte rovnou AI diagnostiku.",
      cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    },
  },

  results: {
    path: "/vysledky",
    name: "Výsledky",
    metadata: {
      title: "Výsledky: AI agenti v provozu | sivak.ai",
      description:
        "Případová studie AI agentů, které stavíme a provozujeme: co agenti dělají, jak běží a co u každého projektu měříme proti výchozímu stavu.",
    },
    title: "Výsledek měříme proti výchozímu stavu",
    lead: "Co naši agenti v provozu dělají, jak běží a jak jejich práci měříme. Případové studie zveřejňujeme anonymně.",
    cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    sections: [
      {
        kind: "work",
        id: "softwarova-firma",
        title: "Tým AI agentů v softwarové firmě",
        lead: "Pro softwarovou firmu provozujeme agenty, kteří každý den pracují vedle lidí z podpory, testování a vývoje.",
        columns: CASE.columns,
        rows: CASE.agents,
        facts: CASE.facts,
      },
      {
        kind: "points",
        id: "co-merime",
        title: "Co u každého projektu měříme",
        items: [
          { title: "Výchozí stav", text: "Před startem pilotu spolu změříme, kolik práce proces dnes stojí. Proti tomu se počítá výsledek." },
          { title: "Odvedená práce", text: "Od prvního dne provozu vidíte, kolik práce agent odvedl." },
          { title: "Ušetřený čas", text: "Kolik času agent vašim lidem ušetřil a kdy se investice vrátí." },
          { title: "Každý krok", text: "Každá akce agenta je zaznamenaná. Víte, co udělal a proč." },
        ],
      },
    ],
    contact: {
      title: "Zjistěte, jaký výsledek by vyšel u vás",
      lead: "V 45minutovém hovoru projdeme váš proces a pošleme jednostránkový odhad návratnosti. Zdarma.",
      cta: [CTA_ESTIMATE, CTA_DIAGNOSTICS],
    },
  },

  about: {
    path: "/o-nas",
    name: "Proč sivak.ai",
    metadata: {
      title: "Proč sivak.ai: manifest zakladatele | sivak.ai",
      description:
        "Proč sivak.ai prodává výsledek, a ne technologii. Krátký manifest zakladatele Mirka Siváka: návratnost předem, člověk rozhoduje a za provoz ručíme.",
    },
    title: "Výrobní firmy nepotřebují další systém. Potřebují, aby práce ubylo.",
    lead: "Proč sivak.ai dělá to, co dělá, a čeho se držíme. Krátký manifest zakladatele. Píše Mirek Sivák.",
    cta: [CTA_ESTIMATE],
    sections: [
      {
        kind: "prose",
        title: "Prodávám výsledek",
        text: [
          "Majitele výrobní firmy nezajímá, jaký model běží na pozadí. Zajímá ho, kolik lidí dnes přepisuje objednávky z e-mailu do ERP a co by ti lidé mohli dělat místo toho.",
          "Proto nezačínám u technologie. Začínám u práce, která firmě zbytečně žere lidi a peníze.",
        ],
      },
      {
        kind: "prose",
        title: "Bez návratnosti nestavíme",
        text: [
          "Než cokoli postavíme, spočítám, kdy se to vrátí. Když to nevychází, řeknu vám to a nestavíme. Raději přijdu o zakázku než o důvěru.",
        ],
        link: { href: "/jak-pracujeme", label: "Jak pracujeme" },
      },
      {
        kind: "prose",
        title: "Agent připraví, člověk rozhodne",
        text: [
          "Nevěřím AI, která rozhoduje sama a nikdo neví proč. Naši agenti práci připraví, váš člověk ji schválí a každý krok je zaznamenaný. Když se něco pokazí, víte kdy, kde a proč.",
        ],
      },
      {
        kind: "prose",
        title: "Co postavíme, to sami napadneme",
        text: [
          "Agent má přístup do vašeho ERP a k vašim datům. Kdo ho nasadí bez bezpečnostních testů, otevírá do firmy nové dveře.",
          "Proto mám v jednom týmu lidi, kteří agenty stavějí, i lidi, kteří systémy napadají. Slabá místa hledáme dřív, než je najde někdo jiný.",
        ],
        link: { href: "/bezpecnost", label: "Bezpečnost" },
      },
      {
        kind: "prose",
        title: "Za provoz ručíme my",
        text: [
          "Agenta vám nepředám s přáním hodně štěstí. Provozujeme ho, hlídáme a upravujeme, když se váš proces změní.",
          "Kde data nesmí opustit firmu, běží agent na vašem vlastním hardwaru, klidně úplně bez internetu.",
        ],
      },
      {
        kind: "prose",
        title: "Kdo to píše",
        text: [
          "Mirek Sivák, zakladatel a CEO sivak.ai. Se svým týmem staví AI agenty, kteří běží v provozu.",
        ],
        link: { href: MIREK_LINKEDIN_URL, label: "Mirek Sivák na LinkedInu" },
      },
    ],
    contact: {
      title: "Napište mi, co vás ve firmě zdržuje",
      lead: "Začneme 45minutovým hovorem a jednostránkovým odhadem návratnosti. Zdarma.",
      cta: [CTA_ESTIMATE, CTA_SECURITY],
    },
  },
} satisfies Record<string, Page>;
