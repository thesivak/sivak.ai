import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon, { type IconName } from "@/components/Icon";

const ICONS: IconName[] = ["agent", "data", "flow", "terminal"];

export default function Services({ t }: { t: Dictionary["services"] }) {
  return (
    <section className="section light services" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="container">
        <div className="section-head reveal">
          <Eyebrow index="02">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <ul className="service-grid reveal">
          {t.items.map((item, i) => (
            <li className="service-card" key={item.title}>
              <div className="service-top">
                <span className="service-icon">
                  <Icon name={ICONS[i] ?? "agent"} />
                </span>
                <span className="service-num">0{i + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ul className="tags">
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
