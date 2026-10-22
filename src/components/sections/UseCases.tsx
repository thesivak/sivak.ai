import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon from "@/components/Icon";

export default function UseCases({ t, contactHref }: { t: Dictionary["useCases"]; contactHref: string }) {
  return (
    <section className="section dark usecases" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="grid-bg" aria-hidden="true" />
      <div className="container">
        <div className="section-head reveal">
          <Eyebrow index="03">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <ol className="uc-list reveal">
          {t.items.map((item, i) => (
            <li className="uc-row" key={item.area}>
              <span className="uc-num" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="uc-area">{item.area}</h3>
              <p className="uc-text">{item.text}</p>
              <p className="uc-output">
                <span>{t.outputLabel}</span>
                {item.output}
              </p>
            </li>
          ))}
        </ol>

        <p className="uc-more reveal">
          <span>{t.more}</span>
          <a href={contactHref}>
            {t.moreLink}
            <Icon name="arrow" />
          </a>
        </p>
      </div>
    </section>
  );
}
