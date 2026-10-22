import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";

export default function Process({ t }: { t: Dictionary["process"] }) {
  return (
    <section className="section light process" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="container">
        <div className="section-head reveal">
          <Eyebrow index="04">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <ol className="p-steps reveal">
          {t.steps.map((step, i) => (
            <li className="p-step" key={step.title}>
              <span className="p-node" aria-hidden="true">
                0{i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <p className="p-output">
                <span>{t.outputLabel}</span>
                {step.output}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
