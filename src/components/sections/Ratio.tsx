import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";

export default function Ratio({ t }: { t: Dictionary["ratio"] }) {
  return (
    <section className="section light ratio" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="container">
        <div className="ratio-top">
          {/* the outlined 80 is the routine agents take over, the solid 20 stays with people */}
          <p className="ratio-figure reveal" aria-hidden="true">
            <span className="r80">80</span>
            <span className="rc">:</span>
            <span className="r20">20</span>
          </p>
          <div className="ratio-copy reveal">
            <Eyebrow index="01">{t.eyebrow}</Eyebrow>
            <h2 className="section-title" id={`${t.id}-title`}>
              {t.title}
            </h2>
            <p className="section-lead">{t.text}</p>
          </div>
        </div>

        <div className="split reveal">
          <div className="split-bars" aria-hidden="true">
            <span className="bar-routine">{t.routine.share}</span>
            <span className="bar-people">{t.people.share}</span>
          </div>
          <div className="split-legend">
            <div className="legend-routine">
              <h3 className="legend-label">
                <b>{t.routine.share}</b>
                {t.routine.label}
              </h3>
              <ul>
                {t.routine.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="legend-people">
              <h3 className="legend-label">
                <b>{t.people.share}</b>
                {t.people.label}
              </h3>
              <ul>
                {t.people.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
