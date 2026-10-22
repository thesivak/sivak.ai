import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon, { type IconName } from "@/components/Icon";

const ICONS: IconName[] = ["cloud", "server"];

// Where agents run: cloud models, or local models on the client's own hardware that work offline
export default function Deployment({ t }: { t: Dictionary["deployment"] }) {
  return (
    <section className="section dark deployment" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="grid-bg" aria-hidden="true" />
      <div className="container">
        <div className="section-head reveal">
          <Eyebrow index="05">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <ul className="deploy-grid reveal">
          {t.options.map((option, i) => (
            <li className={`deploy-card${option.highlight ? " is-highlight" : ""}`} key={option.title}>
              <div className="deploy-top">
                <span className="deploy-icon">
                  <Icon name={ICONS[i] ?? "server"} />
                </span>
                {option.badge && (
                  <span className="deploy-badge">
                    <Icon name="offline" />
                    {option.badge}
                  </span>
                )}
              </div>
              <h3>{option.title}</h3>
              <p className="deploy-text">{option.text}</p>
              <dl className="deploy-specs">
                {option.specs.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="deploy-fit">{option.fit}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
