"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/dictionaries";
import {
  LOGO_VIEWBOX,
  MARK,
  MARK_VIEWBOX,
  WORDMARK,
  WORDMARK_TRANSFORM,
} from "@/components/Logo";

const EMAIL = "mirek@sivak.ai";
const PHONE = "+420 730 515 615";

const MAX_X = 7;
const MAX_Y = 10;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function subscribePointer(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function BusinessCard({ t }: { t: Dictionary }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const touch = useSyncExternalStore(
    subscribePointer,
    () => !window.matchMedia(FINE_POINTER).matches,
    () => false,
  );

  function flip() {
    setFlipped((f) => !f);
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Restart the shadow squash animation
    stage.classList.remove("is-turning");
    void stage.offsetWidth;
    stage.classList.add("is-turning");
  }

  // Tilt toward the pointer, with a moving sheen and a shadow that follows
  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia(FINE_POINTER);

    const cur = { rx: 0, ry: 0, mx: 30, my: 0, sh: 0.45 };
    const tgt = { ...cur };
    let raf = 0;

    function render() {
      let done = true;
      for (const key of Object.keys(tgt) as (keyof typeof tgt)[]) {
        const d = tgt[key] - cur[key];
        cur[key] += d * 0.12;
        if (Math.abs(d) > 0.01) done = false;
        else cur[key] = tgt[key];
      }
      const s = card!.style;
      s.setProperty("--rx", `${cur.rx.toFixed(3)}deg`);
      s.setProperty("--ry", `${cur.ry.toFixed(3)}deg`);
      s.setProperty("--mx", `${cur.mx.toFixed(2)}%`);
      s.setProperty("--my", `${cur.my.toFixed(2)}%`);
      s.setProperty("--sheen", cur.sh.toFixed(3));
      stage!.style.setProperty("--rxn", (cur.rx / MAX_X).toFixed(3));
      stage!.style.setProperty("--ryn", (cur.ry / MAX_Y).toFixed(3));
      raf = done ? 0 : requestAnimationFrame(render);
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    function onMove(e: PointerEvent) {
      if (reduce.matches || !fine.matches || e.pointerType === "touch") return;
      const r = stage!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const nx = clamp((px - 0.5) * 2, -1.25, 1.25);
      const ny = clamp((py - 0.5) * 2, -1.25, 1.25);
      tgt.ry = clamp(nx, -1, 1) * MAX_Y;
      tgt.rx = -clamp(ny, -1, 1) * MAX_X;
      tgt.mx = clamp(px, -0.1, 1.1) * 100;
      tgt.my = clamp(py, -0.1, 1.1) * 100;
      tgt.sh = Math.max(Math.abs(nx), Math.abs(ny)) <= 1.05 ? 1 : 0.6;
      kick();
    }
    function rest() {
      Object.assign(tgt, { rx: 0, ry: 0, mx: 30, my: 0, sh: 0.45 });
      kick();
    }
    function onAnimationEnd(e: AnimationEvent) {
      if (e.animationName === "squash") stage!.classList.remove("is-turning");
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", rest);
    window.addEventListener("blur", rest);
    stage.addEventListener("animationend", onAnimationEnd);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", rest);
      window.removeEventListener("blur", rest);
      stage.removeEventListener("animationend", onAnimationEnd);
    };
  }, []);

  function onCardClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) return;
    if (String(window.getSelection?.() ?? "").length) return;
    flip();
  }

  const c = t.card;
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(t.mailSubject)}`;

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <path id="p-mark" d={MARK} />
          <path id="p-word" d={WORDMARK} transform={WORDMARK_TRANSFORM} />
        </defs>
      </svg>

      <div className="stage" ref={stageRef}>
        <div className="ground" aria-hidden="true" />

        <div
          className={`card${flipped ? " is-flipped" : ""}`}
          id="vizitka"
          ref={cardRef}
          role="group"
          aria-roledescription={c.roleDescription}
          aria-label={c.label}
          onClick={onCardClick}
        >
          <div className="flipper">
            <section className="face front" aria-label={c.front} inert={flipped} aria-hidden={flipped || undefined}>
              <h1 className="logo">
                <svg viewBox={LOGO_VIEWBOX} role="img" aria-label="sivak.ai" fill="currentColor">
                  <use href="#p-mark" />
                  <use href="#p-word" />
                </svg>
              </h1>
              <p className="tagline">{t.tagline}</p>

              <div className="front-foot">
                <p className="person">
                  <span className="name">{t.person.name}</span>
                  <span className="role">{t.person.role}</span>
                </p>
                <p className="contact">
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  <a href={`tel:${PHONE.replaceAll(" ", "")}`}>{PHONE}</a>
                </p>
              </div>
            </section>

            <section className="face back" aria-label={c.back} inert={!flipped} aria-hidden={!flipped || undefined}>
              <div className="rule">
                <p className="ratio">
                  <span>80</span>
                  <i>:</i>
                  <span>20</span>
                </p>
                <p className="rule-text">{c.rule}</p>
                <svg className="back-mark" viewBox={MARK_VIEWBOX} fill="currentColor" aria-hidden="true" focusable="false">
                  <use href="#p-mark" />
                </svg>
              </div>

              <h2 className="back-label">{c.servicesLabel}</h2>

              <ol className="services">
                {c.services.map((s, i) => (
                  <li key={s.title}>
                    <span className="num" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>

              <dl className="facts">
                <div>
                  <dt>{c.approachLabel}</dt>
                  <dd>
                    {c.approach.map((item, i) => (
                      <span key={item}>
                        {i > 0 && (
                          <span className="dot" aria-hidden="true">
                            ·
                          </span>
                        )}
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>{c.caseLabel}</dt>
                  <dd>{c.case}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>

      <p className="lead">{t.lead}</p>

      <p className="hint">
        <span className="hint-text">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9.5V3.2a1.2 1.2 0 0 1 2.4 0V8l3.1.6c.9.2 1.4 1 1.3 1.9l-.5 3.5H6.6L4 10.9a1.1 1.1 0 0 1 1.6-1.5z" />
          </svg>
          <span>{touch ? t.controls.hintTap : t.controls.hintClick}</span>
        </span>
        <button
          className="flip-btn"
          type="button"
          aria-controls="vizitka"
          aria-pressed={flipped}
          aria-label={flipped ? t.controls.flipToFront : t.controls.flipToBack}
          onClick={flip}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13.2 8A5.2 5.2 0 1 1 11.6 4.2" />
            <path d="M12 1.8v2.8H9.2" />
          </svg>
          {t.controls.flip}
        </button>
      </p>

      <div className="ctas">
        <a className="btn btn-primary" href={mailto}>
          {t.cta}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </a>
        <a className="btn btn-secondary" href="/mirek-sivak.vcf" download>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2.5v8M4.8 7.5 8 10.7l3.2-3.2M3 13.5h10" />
          </svg>
          {t.saveContact}
        </a>
      </div>

      <p className="sr-only" aria-live="polite">
        {flipped ? t.controls.statusBack : ""}
      </p>
    </>
  );
}
