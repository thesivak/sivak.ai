import type { Locale } from "@/i18n/config";

// Company facts shared by the contact section, the footer and the structured data.
export const SITE_URL = "https://www.sivak.ai";

// TODO: doplnit LinkedIn URL. While it is the placeholder, no LinkedIn link is shown anywhere.
export const MIREK_LINKEDIN_URL = "https://www.linkedin.com/in/TODO";
export const MIREK_LINKEDIN: string | null = MIREK_LINKEDIN_URL.includes("/in/TODO") ? null : MIREK_LINKEDIN_URL;

// Draft privacy policy, waiting for the legal check (see the comment in the page)
export const PRIVACY_POLICY_URL = "/ochrana-osobnich-udaju";

// Google Analytics 4, on every page as on the Next.js site
export const GA_MEASUREMENT_ID = "G-S98V3B32ZL";

export const COMPANY = {
  brand: "sivak.ai",
  legalName: "TheSivak s.r.o.",
  city: "Šumperk",
  ico: "23010282",
};

export type Person = {
  name: string;
  role: string;
  email: string;
  phone?: string;
  vcard: string;
};

// Mirek is listed with email only; the phone number belongs to the key account manager.
export const PEOPLE: Person[] = [
  { name: "Mirek Sivák", role: "Founder & CEO", email: "mirek@sivak.ai", vcard: "/mirek-sivak.vcf" },
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

export function organizationJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: lang === "cs" ? `${SITE_URL}/` : `${SITE_URL}/en`,
    logo: `${SITE_URL}/brand/logo.svg`,
    identifier: { "@type": "PropertyValue", propertyID: "IČO", value: COMPANY.ico },
    address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressCountry: "CZ" },
    founder: { "@type": "Person", name: FOUNDER.name, jobTitle: FOUNDER.role, email: FOUNDER.email },
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
