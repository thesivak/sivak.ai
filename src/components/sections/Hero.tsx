import type { Dictionary } from "@/dictionaries";
import AgentConsole from "@/components/AgentConsole";
import Icon from "@/components/Icon";

export default function Hero({ t, ctaHref, processHref }: { t: Dictionary; ctaHref: string; processHref: string }) {
  const h = t.hero;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <i aria-hidden="true" />
            {h.eyebrow}
          </p>
          <h1 className="hero-title" id="hero-title">
            {h.title} <span className="hero-accent">{h.titleAccent}</span>
          </h1>
          <p className="hero-lead">{h.lead}</p>

          {/* 80:20 — the routine agents take over becomes time for what matters */}
          <div className="hero-gain">
            <strong className="gain-figure">{h.gain.figure}</strong>
            <p className="gain-title">{h.gain.title}</p>
            <p className="gain-text">{h.gain.text}</p>
          </div>

          <div className="hero-actions">
            <a className="btn btn-light" href={ctaHref}>
              {h.primary}
              <Icon name="arrow" />
            </a>
            <a className="btn btn-ghost" href={processHref}>
              {h.secondary}
            </a>
          </div>

          <ul className="hero-notes">
            {h.notes.map((note) => (
              <li key={note}>
                <Icon name="check" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <AgentConsole t={t.console} />
        </div>
      </div>
    </section>
  );
}
