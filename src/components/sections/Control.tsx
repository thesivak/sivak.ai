import type { Dictionary } from "@/dictionaries";
import Eyebrow from "@/components/Eyebrow";
import Icon, { type IconName } from "@/components/Icon";

const ICONS: IconName[] = ["approve", "shield", "lock", "layers", "eye", "chart"];

type Manifest = Dictionary["control"]["manifest"];

// The agent's permissions written out like its configuration file
function ManifestCard({ m }: { m: Manifest }) {
  const pair = (key: string, value: string) => (
    <>
      <span className="m-key">{key}:</span> <span className="m-val">{value}</span>
    </>
  );
  const lines: { id: string; content: React.ReactNode }[] = [
    { id: m.agent[0], content: pair(m.agent[0], m.agent[1]) },
    { id: m.accessKey, content: <span className="m-key">{m.accessKey}:</span> },
    ...m.access.map(([name, level]) => ({
      id: `${m.accessKey}-${name}`,
      content: (
        <span className="m-indent">
          <span className="m-val">{name}:</span> <span className="m-level">{level}</span>
        </span>
      ),
    })),
    ...m.rest.map(([key, value]) => ({ id: key, content: pair(key, value) })),
  ];

  return (
    <figure className="manifest reveal" aria-label={m.label}>
      <figcaption className="manifest-bar">
        <Icon name="shield" />
        {m.file}
      </figcaption>
      <div className="manifest-body">
        {lines.map((line, i) => (
          <div className="m-line" key={line.id}>
            <span className="m-ln" aria-hidden="true">
              {i + 1}
            </span>
            <code>{line.content}</code>
          </div>
        ))}
      </div>
    </figure>
  );
}

export default function Control({ t }: { t: Dictionary["control"] }) {
  return (
    <section className="section dark control" id={t.id} aria-labelledby={`${t.id}-title`}>
      <div className="control-glow" aria-hidden="true" />
      <div className="container">
        <div className="section-head reveal">
          <Eyebrow index="06">{t.eyebrow}</Eyebrow>
          <h2 className="section-title" id={`${t.id}-title`}>
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <div className="control-grid">
          <ManifestCard m={t.manifest} />
          <ul className="control-items reveal">
            {t.items.map((item, i) => (
              <li className="c-item" key={item.title}>
                <Icon name={ICONS[i] ?? "shield"} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
