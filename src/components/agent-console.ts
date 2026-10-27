// Drives the AgentConsole markup: the same timing and behaviour as the React component it replaced.
type Step = { text: string; result: string; time: string };
type Agent = { short: string; name: string; task: string; steps: Step[]; state: "waiting" | "done"; outcome: string; action: string };
type Data = { states: Record<"running" | "waiting" | "done", string>; agents: Agent[] };

// One step finishes every STEP_MS; the finished task stays on screen for HOLD_MS
const STEP_MS = 1150;
const HOLD_MS = 3600;

export function runAgentConsole(root: HTMLElement) {
  const data: Data = JSON.parse(root.querySelector('script[type="application/json"]')!.textContent!);
  const consoleEl = root.querySelector<HTMLElement>(".console")!;
  const strip = root.querySelector<HTMLElement>(".console-tabs")!;
  const tabs = Array.from(strip.querySelectorAll<HTMLButtonElement>(".console-tab"));
  const name = root.querySelector(".task-name")!;
  const sub = root.querySelector(".task-sub")!;
  const chip = root.querySelector(".state-chip")!;
  const bar = root.querySelector<HTMLElement>(".task-progress i")!;
  const list = root.querySelector(".task-steps")!;
  const outcome = root.querySelector(".task-outcome")!;
  const pending = outcome.querySelector(".outcome-pending")!;
  const result = outcome.querySelector(".outcome-result")!;
  const checkIcon = root.querySelector("[data-check-icon] svg")!;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = 0;
  let done = 0;
  let visible = false;
  let reduced = reducedQuery.matches;
  let timer: number | undefined;

  function render() {
    const agent = data.agents[active];
    const total = agent.steps.length;
    // Without motion every task is shown finished; the tabs still switch between agents
    const shown = reduced ? total : done;
    const finished = shown >= total;
    const state = finished ? agent.state : "running";

    tabs.forEach((tab, i) => tab.setAttribute("aria-pressed", String(i === active)));
    name.textContent = agent.name;
    sub.textContent = agent.task;
    chip.className = `state-chip is-${state}`;
    chip.textContent = data.states[state];
    bar.style.transform = `scaleX(${shown / total})`;

    list.replaceChildren(
      ...agent.steps.map((step, i) => {
        const status = i < shown ? "done" : i === shown ? "running" : "pending";
        const li = document.createElement("li");
        li.className = `task-step is-${status}`;
        const icon = span("step-icon", "");
        icon.setAttribute("aria-hidden", "true");
        if (status === "done") icon.appendChild(checkIcon.cloneNode(true));
        // appendChild rather than append(): the Workers types in this project redefine Element.append
        [
          icon,
          span("step-text", step.text),
          span("step-result", status === "done" ? step.result : status === "running" ? "…" : ""),
          span("step-time", status === "done" ? step.time : ""),
        ].forEach((child) => li.appendChild(child));
        return li;
      }),
    );

    outcome.className = `task-outcome is-${agent.state}${finished ? " is-shown" : ""}`;
    pending.setAttribute("aria-hidden", String(finished));
    result.setAttribute("aria-hidden", String(!finished));
    result.querySelector("p")!.textContent = agent.outcome;
    result.querySelector(".outcome-action")!.textContent = agent.action;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (reduced || !visible) return;
    const total = data.agents[active].steps.length;
    timer = window.setTimeout(
      () => {
        if (done < total) {
          done += 1;
        } else {
          select((active + 1) % data.agents.length);
          return;
        }
        render();
        schedule();
      },
      done < total ? STEP_MS : HOLD_MS,
    );
  }

  function select(i: number) {
    active = i;
    done = 0;
    render();
    centreTab();
    schedule();
  }

  // With more agents than fit, the tab strip scrolls: fade the edges that hide tabs…
  function updateFade() {
    const left = strip.scrollLeft > 2;
    const right = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2;
    strip.dataset.fade = left && right ? "both" : left ? "left" : right ? "right" : "none";
  }

  // …and bring the working agent's tab to the middle, scrolling only the strip, never the page
  function centreTab() {
    const tab = tabs[active];
    strip.scrollTo({
      left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
  strip.addEventListener("scroll", updateFade, { passive: true });
  window.addEventListener("resize", updateFade);
  reducedQuery.addEventListener("change", () => {
    reduced = reducedQuery.matches;
    render();
    schedule();
  });
  // Only animate while the console is on screen
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    },
    { threshold: 0.15 },
  ).observe(consoleEl);

  updateFade();
  if (reduced) render();
  centreTab();
}

function span(className: string, text: string) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}
