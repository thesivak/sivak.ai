import type { Locale } from "@/i18n/config";

// Company facts shared by the contact section, the footer and the structured data.
export const SITE_URL = "https://www.sivak.ai";
// The organisation's node in the homepage JSON-LD; other pages refer to it by this @id
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// Mirek's LinkedIn profile: the /ai-skoleni trainer section, the homepage contact card and JSON-LD sameAs.
// Set it back to a "/in/TODO" placeholder and every LinkedIn link disappears.
export const MIREK_LINKEDIN_URL = "https://www.linkedin.com/in/mireksivak/";
export const MIREK_LINKEDIN: string | null = MIREK_LINKEDIN_URL.includes("/in/TODO") ? null : MIREK_LINKEDIN_URL;

// Draft privacy policy, waiting for the legal check (see the comment in the page)
export const PRIVACY_POLICY_URL = "/ochrana-osobnich-udaju";

// Google Analytics 4, on every page as on the Next.js site
export const GA_MEASUREMENT_ID = "G-S98V3B32ZL";

export const COMPANY = {
  brand: "sivak.ai",
  legalName: "TheSivak s.r.o.",
  ico: "23010282",
  // The seat (sídlo) as stated on the site: Mirek's decision of 1 November 2026, ahead of the notarial
  // seat change in the commercial register. Shown in the footer's legal line, the privacy policy
  // (controller), the vCards and the Organization JSON-LD. The register entry (court, section, insert) is
  // unchanged in src/content/home/{cs,en}.yaml and the privacy policy until the court records the move.
  seat: {
    building: "The Flow Building",
    street: "Václavské náměstí 47",
    postalCode: "110 00",
    locality: { cs: "Praha 1", en: "Prague 1" },
  },
};

/**
 * The seat on one line. English uses the English name of the city and adds the country
 * ("…, 110 00 Prague 1, Czech Republic"); the building and street keep their Czech names in both.
 * Postal code and district number are joined with no-break spaces so they never split across lines.
 */
export function seatAddress(lang: Locale): string {
  const { building, street, postalCode, locality } = COMPANY.seat;
  const nb = (text: string) => text.replaceAll(" ", "\u00a0");
  const line = `${building}, ${street}, ${nb(postalCode)} ${nb(locality[lang])}`;
  return lang === "cs" ? line : `${line}, Czech Republic`;
}

export type Person = {
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  vcard: string;
};

// Mirek is listed with email only; the phone number belongs to the key account manager.
export const PEOPLE: Person[] = [
  { name: "Mirek Sivák", role: "Founder & CEO", email: "mirek@sivak.ai", linkedin: MIREK_LINKEDIN ?? undefined, vcard: "/mirek-sivak.vcf" },
  {
    name: "Matouš Čep",
    role: "Key account manager",
    email: "matous@sivak.ai",
    phone: "+420 731 504 378",
    vcard: "/matous-cep.vcf",
  },
];

const [FOUNDER, ACCOUNT_MANAGER] = PEOPLE;

// The controller contact in the privacy policy. Not shown on /ai-skoleni, where the form is the only contact.
export const PRIVACY_CONTACT_EMAIL = ACCOUNT_MANAGER.email;

// Meeting requests go to the key account manager, with the founder in copy.
export function meetingHref(subject: string): string {
  return `mailto:${ACCOUNT_MANAGER.email}?cc=${FOUNDER.email}&subject=${encodeURIComponent(subject)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replaceAll(" ", "")}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

// The organisation (plain Organization: schema.org deprecates ProfessionalService), with only what the site shows: the contact section lists both
// e-mail addresses and the account manager's phone, the footer the legal name, seat and company ID.
function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/logo.svg`,
    image: `${SITE_URL}/og/cs.png`,
    identifier: { "@type": "PropertyValue", propertyID: "IČO", value: COMPANY.ico },
    address: {
      "@type": "PostalAddress",
      name: COMPANY.seat.building,
      streetAddress: COMPANY.seat.street,
      addressLocality: COMPANY.seat.locality.cs,
      postalCode: COMPANY.seat.postalCode.replaceAll(" ", ""),
      addressCountry: "CZ",
    },
    areaServed: { "@type": "Country", name: "CZ" },
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      email: FOUNDER.email,
      ...(FOUNDER.linkedin ? { sameAs: [FOUNDER.linkedin] } : {}),
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      name: ACCOUNT_MANAGER.name,
      email: ACCOUNT_MANAGER.email,
      telephone: ACCOUNT_MANAGER.phone?.replaceAll(" ", ""),
      availableLanguage: ["cs", "en"],
    },
  };
}

export type ServiceInfo = { name: string; description: string; path: string };

/**
 * The homepage's structured data as one graph: the website, the organisation and the services it offers
 * (each with the organisation's @id as provider; no prices). Other pages point at ORGANIZATION_ID.
 */
export function homeJsonLd(lang: Locale, services: ServiceInfo[]) {
  const home = lang === "cs" ? `${SITE_URL}/` : `${SITE_URL}/en`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${home}#website`, url: home, name: COMPANY.brand, inLanguage: lang, publisher: { "@id": ORGANIZATION_ID } },
      organization(),
      ...services.map((service) => ({
        "@type": "Service",
        "@id": `${SITE_URL}${service.path}#service`,
        name: service.name,
        description: service.description,
        url: `${SITE_URL}${service.path}`,
        areaServed: { "@type": "Country", name: "CZ" },
        provider: { "@id": ORGANIZATION_ID },
      })),
    ],
  };
}

/** BreadcrumbList for a subpage: home first, the page last; absolute URLs as in the pages' canonicals. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}
