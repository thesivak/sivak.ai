import type { Block, Cta, IndexItem, Question, Step } from "./types";

// Nabídka sivak.ai pro výrobní firmy: to, co se opakuje na více českých stránkách (cs.ts, pages.ts), je tady
// jednou, aby si web neodporoval. Web neuvádí žádné ceny: klient je dostane v nabídce.

/** Dvě výzvy k akci celého webu. Otevírají e-mail s typem poptávky v předmětu (meetingHref v src/lib/site.ts). */
export const CTA_DIAGNOSTICS: Cta = { label: "Objednat AI diagnostiku", subject: "Objednávka: AI diagnostika" };
export const CTA_ESTIMATE: Cta = { label: "Odhad návratnosti zdarma", subject: "Odhad návratnosti zdarma" };
export const CTA_SECURITY: Cta = { label: "Domluvit bezpečnostní prověrku", subject: "Poptávka: bezpečnostní prověrka" };

/** Čtyři fáze spolupráce, číslované od nuly. Na konci každé se rozhoduje klient. */
export const LADDER: Step[] = [
  {
    title: "Odhad návratnosti",
    text: "Zdarma. 45minutový hovor a jednostránkový odhad, kolik práce a peněz se dá ušetřit. Pak se rozhodnete, jestli má smysl jít dál.",
  },
  {
    title: "AI diagnostika",
    text: `Dvoudenní workshop: mapa procesu, příležitosti seřazené podle návratnosti, klikací prototyp a nabídka s pevnou cenou. Cenu diagnostiky při navazujícím pilotu odečteme z jeho ceny.`,
  },
  {
    title: "Pilot",
    text: "Jeden proces, 4–8 týdnů, pevná cena. Výsledek měříme proti výchozímu stavu a vy rozhodnete, jestli agent půjde do provozu.",
  },
  {
    title: "Provoz",
    text: "Měsíční poplatek za provoz, monitoring, úpravy a opakované bezpečnostní testy. S garantovanými reakčními dobami.",
  },
];

/** Tři pojmenované startovní nabídky; `points` je to, co klient dostane. */
export const STARTERS: IndexItem[] = [
  {
    title: "Audit malých objednávek",
    text: "Spočítáme, kolik vás stojí vyřízení jedné malé objednávky a kolik jich měsíčně projde. Ukážeme, které kroky může převzít agent.",
    points: ["Náklad na vyřízení jedné objednávky", "Kroky, které převezme agent", "Odhad návratnosti"],
  },
  {
    title: "Kontrola faktur dodavatelů proti objednávkám",
    text: "Agent porovná každou přijatou fakturu s objednávkou a příjemkou v ERP. Shodné připraví k zaúčtování, rozdíly v ceně nebo množství předá účetní s vysvětlením.",
    points: ["Faktury spárované s objednávkami", "Seznam rozdílů k rozhodnutí", "Zaúčtování schvaluje účetní"],
  },
  {
    title: "Automatický příjem objednávek z e-mailu do ERP",
    text: "Agent přečte objednávku z e-mailu, PDF nebo Excelu, dohledá zákazníka a položky a připraví ji v ERP. Váš člověk ji zkontroluje a potvrdí.",
    points: ["Objednávka připravená v ERP", "Nejasnosti označené ke kontrole", "Potvrzuje váš člověk"],
  },
];

/** Jediná případová studie, kterou web zveřejňuje: anonymně a jen ve schválených formulacích. */
export const CASE = {
  columns: ["Agent", "Co dělá", "Jak běží"] as [string, string, string],
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
};

export const CONTROL: Block = {
  kind: "points",
  title: "Agent připraví. Člověk rozhodne.",
  lead: "Agenti pracují v jasných mantinelech. Vždy víte, co dělají, k čemu mají přístup a proč došli k výsledku.",
  items: [
    { title: "Schvaluje člověk", text: "Důležité kroky, jako potvrzení objednávky, zaúčtování faktury nebo odpověď zákazníkovi, vždy potvrdí člověk." },
    { title: "Jen nutná oprávnění", text: "Agent dostane přístup jen k tomu, co ke své práci potřebuje. Většinou jen ke čtení." },
    { title: "Hesla nevidí", text: "Přístupové údaje spravuje systém. Agent je nikdy nedostane do rukou." },
    { title: "Zkouší na kopii", text: "Testuje a zkouší na kopii dat. Ostrý provoz zůstává nedotčený." },
    { title: "Záznam každého kroku", text: "Každá akce je zaznamenaná, včetně snímků obrazovky a videa. Víte, co agent udělal a proč." },
    { title: "Měřitelný výsledek", text: "Vidíte, kolik práce agent odvedl a kolik času vám ušetřil." },
  ],
};

export const DEPLOYMENT: Block = {
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
};

/** Otázky, které se opakují na více stránkách. */
export const Q = {
  systems: {
    q: "Musíme kvůli agentům měnit ERP?",
    a: "Ne. Agent pracuje v systémech, které už používáte. Kde chybí napojení, ovládá program přes obrazovku stejně jako člověk.",
  },
  mistake: {
    q: "Co když agent udělá chybu?",
    a: "Agent připraví, člověk rozhodne. Důležité kroky vždy schvaluje člověk a každá akce agenta je zaznamenaná, takže víte, co udělal a proč.",
  },
  where: {
    q: "Kde AI běží?",
    a: "V cloudu, nebo na vašem vlastním hardwaru. Pokud data nesmí opustit firmu, nasadíme lokální modely na váš server. Fungují i bez přístupu k internetu.",
  },
  access: {
    q: "K čemu má agent přístup?",
    a: "Jen k tomu, co ke své práci potřebuje, většinou jen ke čtení. Hesla nevidí a zkouší na kopii dat, ne v ostrém provozu.",
  },
  price: {
    q: "Kolik to stojí?",
    a: "Odhad návratnosti je zdarma. AI diagnostika má pevnou cenu, kterou znáte předem, a při navazujícím pilotu ji odečteme z jeho ceny. Pevnou cenu pilotu a měsíční poplatek za provoz dostanete v nabídce na konci diagnostiky.",
  },
  noReturn: {
    q: "Co když návratnost nevyjde?",
    a: "Řekneme vám to a nestavíme. Bez návratnosti nestavíme: je lepší to zjistit z jednostránkového odhadu než po půl roce práce.",
  },
} satisfies Record<string, Question>;
