import type { Dictionary } from "@/dictionaries";
import { BrandLogo } from "@/components/Logo";
import { COMPANY, PEOPLE } from "@/lib/site";

type Props = {
  t: Dictionary;
  homeHref: string;
  switchHref: string;
  switchLang: string;
};

export default function SiteFooter({ t, homeHref, switchHref, switchLang }: Props) {
  const f = t.footer;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="footer-logo" href={homeHref} aria-label={t.nav.home}>
              <BrandLogo />
            </a>
            <p>{f.tagline}</p>
          </div>

          <nav className="footer-col" aria-label={f.navLabel}>
            <h2>{f.navLabel}</h2>
            <ul>
              {t.nav.items.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2>{f.contactLabel}</h2>
            <ul>
              {PEOPLE.map((person) => (
                <li key={person.email}>
                  <a href={`mailto:${person.email}`}>{person.email}</a>
                </li>
              ))}
              <li>
                <a href={switchHref} hrefLang={switchLang} lang={switchLang}>
                  {t.langSwitch.label}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* § 435 of the Czech Civil Code: name, seat, company ID and register entry */}
        <div className="footer-legal">
          <p>
            {f.operatedBy} {COMPANY.legalName}, {COMPANY.city}, {f.idLabel}
            {" "}
            {COMPANY.ico}. {f.registry}
          </p>
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
