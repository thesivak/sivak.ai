import type { Locale } from "@/i18n/config";

// Company facts shared by the contact section, the footer and the structured data.
export const SITE_URL = "https://www.sivak.ai";
// The organisation's node in the homepage JSON-LD; other pages refer to it by this @id
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// Mirek's LinkedIn profile: the homepage contact card and JSON-LD sameAs.
// Set it back to a "/in/TODO" placeholder and every LinkedIn link disappears.
export const MIREK_LINKEDIN_URL = "https://www.linkedin.com/in/mireksivak/";
export const MIREK_LINKEDIN: string | null = MIREK_LINKEDIN_URL.includes("/in/TODO") ? null : MIREK_LINKEDIN_URL;

// Draft privacy policy, waiting for the legal check (see the comment in the page)
export const PRIVACY_POLICY_URL = "/ochrana-osobnich-udaju";

// Google Analytics 4, on every page as on the Next.js site
export const GA_MEASUREMENT_ID = "G-S98V3B32ZL";

export const COMPANY = {
  brand: "sivak.ai",
  // Name and seat (sídlo) as recorded in the commercial register on 20 November 2026. Register entry:
  // Krajský soud v Ostravě, oddíl C, vložka 98925 (the footer copy in src/site/{cs,en}.ts and the privacy
  // policy). Name and seat are shown in the footer's legal line, the privacy policy (controller), the
  // vCards (public/*.vcf) and the Organization JSON-LD.
  legalName: "sivak.ai s.r.o.",
  ico: "23010282",
  seat: {
    street: "Václavské náměstí 2132/47",
    district: "Nové Město",
    postalCode: "110 00",
    locality: { cs: "Praha 1", en: "Prague 1" },
  },
};

/**
 * The seat on one line. English uses the English name of the city and adds the country
 * ("…, 110 00 Prague 1, Czech Republic"); the street and the district (Nové Město) keep their Czech names.
 * Postal code and district number are joined with no-break spaces so they never split across lines.
 */
export function seatAddress(lang: Locale): string {
  const { street, district, postalCode, locality } = COMPANY.seat;
  const nb = (text: string) => text.replaceAll(" ", "\u00a0");
  const line = `${street}, ${district}, ${nb(postalCode)} ${nb(locality[lang])}`;
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

// Contact details shared by both language versions.
export const PEOPLE: Person[] = [
  { name: "Mirek Sivák", role: "Founder & CEO", email: "mirek@sivak.ai", linkedin: MIREK_LINKEDIN ?? undefined, vcard: "/mirek-sivak.vcf" },
  {
    name: "Matouš Čep",
    role: "Key account manager",
    email: "matous@sivak.ai",
    vcard: "/matous-cep.vcf",
  },
];

const [FOUNDER, ACCOUNT_MANAGER] = PEOPLE;

// The controller contact in the privacy policy.
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
// e-mail addresses, the footer the legal name, seat and company ID.
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
      streetAddress: COMPANY.seat.street,
      addressLocality: `${COMPANY.seat.district}, ${COMPANY.seat.locality.cs}`,
      postalCode: COMPANY.seat.postalCode,
      addressCountry: "CZ",
    },
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
