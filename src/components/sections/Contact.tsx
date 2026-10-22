import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon from "@/components/Icon";
import { MARK, MARK_VIEWBOX } from "@/components/Logo";
import { PEOPLE, initials, meetingHref, telHref } from "@/lib/site";

export default function Contact({ t }: { t: Dictionary["contact"] }) {
  return (
    <section className="section dark contact" id={t.id} aria-labelledby={`${t.id}-title`}>
      {/* the doorway from the logo, as an open door into the conversation */}
      <svg className="contact-mark" viewBox={MARK_VIEWBOX} aria-hidden="true" focusable="false">
        <path d={MARK} />
      </svg>

      <div className="container contact-grid">
        <div className="contact-copy reveal">
          <Eyebrow index="09">{t.eyebrow}</Eyebrow>
          <h2 className="section-title contact-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
          <a className="btn btn-light contact-cta" href={meetingHref(t.mailSubject)}>
            {t.cta}
            <Icon name="arrow" />
          </a>
        </div>

        <ul className="people reveal">
          {PEOPLE.map((person) => (
            <li className="person" key={person.email}>
              <span className="avatar" aria-hidden="true">
                {initials(person.name)}
              </span>
              <div className="person-body">
                <h3>{person.name}</h3>
                <p className="person-role">{person.role}</p>
                <ul className="person-links">
                  <li>
                    <a href={`mailto:${person.email}`}>
                      <Icon name="mail" />
                      <span className="sr-only">{t.emailLabel}: </span>
                      {person.email}
                    </a>
                  </li>
                  {person.phone && (
                    <li>
                      <a href={telHref(person.phone)}>
                        <Icon name="phone" />
                        <span className="sr-only">{t.phoneLabel}: </span>
                        {person.phone}
                      </a>
                    </li>
                  )}
                </ul>
                <a className="vcard-link" href={person.vcard} download>
                  <Icon name="download" />
                  {t.saveContact}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
