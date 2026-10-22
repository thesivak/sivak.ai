import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon from "@/components/Icon";

export default function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <section className="section light faq" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="container faq-grid">
        <div className="section-head reveal">
          <Eyebrow index="08">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
        </div>

        <div className="faq-list reveal">
          {t.items.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <Icon name="plus" />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
