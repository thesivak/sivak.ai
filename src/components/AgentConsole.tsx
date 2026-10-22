"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/dictionaries";
import Icon from "@/components/Icon";

type ConsoleText = Dictionary["console"];
type State = keyof ConsoleText["states"];

// One step finishes every STEP_MS; the finished task stays on screen for HOLD_MS
const STEP_MS = 1150;
const HOLD_MS = 3600;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// An illustrative dashboard: agents work through their steps one after another,
// then hand the result to a person or report it as done.
export default function AgentConsole({ t }: { t: ConsoleText }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(0);
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const agent = t.agents[active];
  const total = agent.steps.length;
  // Without motion every task is shown finished; the tabs still switch between agents
  const shown = reduced ? total : done;
  const finished = shown >= total;
  const state = (finished ? agent.state : "running") as State;

  // Only animate while the console is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const timer = window.setTimeout(
      () => {
        if (done < total) {
          setDone(done + 1);
        } else {
          setActive((active + 1) % t.agents.length);
          setDone(0);
        }
      },
      done < total ? STEP_MS : HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, done, reduced, visible, total, t.agents.length]);

  function select(i: number) {
    setActive(i);
    setDone(0);
  }

  return (
    <figure className="console-wrap">
      <div className="console" ref={rootRef} role="group" aria-label={t.label}>
        <div className="console-bar">
          <span className="console-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="console-app">{t.app}</span>
          <span className="console-live">
            <i aria-hidden="true" />
            {t.live}
          </span>
        </div>

        <div className="console-tabs" role="group" aria-label={t.agentsLabel}>
          {t.agents.map((a, i) => (
            <button
              key={a.name}
              type="button"
              className="console-tab"
              aria-pressed={i === active}
              onClick={() => select(i)}
            >
              <i aria-hidden="true" />
              {a.short}
            </button>
          ))}
        </div>

        <div className="console-main">
          <div className="task-head">
            <div className="task-title">
              <p className="task-name">{agent.name}</p>
              <p className="task-sub">{agent.task}</p>
            </div>
            <span className={`state-chip is-${state}`}>{t.states[state]}</span>
          </div>

          <div className="task-progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${shown / total})` }} />
          </div>

          <ol className="task-steps">
            {agent.steps.map((step, i) => {
              const status = i < shown ? "done" : i === shown ? "running" : "pending";
              return (
                <li key={step.text} className={`task-step is-${status}`}>
                  <span className="step-icon" aria-hidden="true">
                    {status === "done" && <Icon name="check" />}
                  </span>
                  <span className="step-text">{step.text}</span>
                  <span className="step-result">{status === "done" ? step.result : status === "running" ? "…" : ""}</span>
                  <span className="step-time">{status === "done" ? step.time : ""}</span>
                </li>
              );
            })}
          </ol>

          {/* Both layers share one cell, so the console keeps its height when the result appears */}
          <div className={`task-outcome is-${agent.state}${finished ? " is-shown" : ""}`}>
            <p className="outcome-pending" aria-hidden={finished}>
              {t.preparing}
            </p>
            <div className="outcome-result" aria-hidden={!finished}>
              <p>{agent.outcome}</p>
              <span className="outcome-action">{agent.action}</span>
            </div>
          </div>
        </div>

        <div className="console-foot" aria-hidden="true">
          {t.footer.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <figcaption className="console-caption">{t.caption}</figcaption>
    </figure>
  );
}
