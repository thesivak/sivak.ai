import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon, { type IconName } from "@/components/Icon";

const ICONS: IconName[] = ["chat", "browser", "code", "pen"];

export default function CaseStudy({ t }: { t: Dictionary["case"] }) {
  return (
    <section className="section light case" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="container">
        <div className="case-head reveal">
          <div className="section-head">
            <Eyebrow index="07">{t.eyebrow}</Eyebrow>
            <h2 className="section-title" id={`${t.id}-title`}>
              {t.title}
            </h2>
            <p className="section-lead">{t.lead}</p>
          </div>
          <ul className="case-facts">
            {t.facts.map((fact) => (
              <li key={fact}>
                <Icon name="check" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <ul className="case-grid reveal">
          {t.agents.map((agent, i) => (
            <li className="case-card" key={agent.name}>
              <div className="case-card-top">
                <span className="case-icon">
                  <Icon name={ICONS[i] ?? "agent"} />
                </span>
                <span className="case-status">
                  <i aria-hidden="true" />
                  {t.status}
                </span>
              </div>
              <h3>{agent.name}</h3>
              <p>{agent.text}</p>
              <p className="case-meta">{agent.meta}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
