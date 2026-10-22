// Line icons on a 24px grid, drawn with a 1.5px stroke in the current text colour.
const PATHS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  mail: "M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM3.5 7l8.5 6.5L20.5 7",
  phone:
    "M7 3.5h2.6l1.6 4.4-2.1 1.4a11.5 11.5 0 0 0 5.6 5.6l1.4-2.1 4.4 1.6V17a3 3 0 0 1-3 3C10.3 20 4 13.7 4 6.5a3 3 0 0 1 3-3z",
  download: "M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14",
  agent: "M8 8h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3zM12 4.5V8M9.5 12.5v1.5M14.5 12.5v1.5M2.5 13v2M21.5 13v2",
  data: "M12 3.5c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 6.5v5.5c0 1.7 3.1 3 7 3s7-1.3 7-3V6.5M5 12v5.5c0 1.7 3.1 3 7 3s7-1.3 7-3V12",
  flow: "M4 8h12M12.5 4.5 16 8l-3.5 3.5M20 16H8M11.5 12.5 8 16l3.5 3.5",
  terminal: "M4 4.5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM7 9.5l3 2.5-3 2.5M12.5 15H17",
  approve: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6 1.3 0 2.5.4 3.5 1.1M15 17l2 2 4-4.5",
  shield: "M12 3.5 19 6v5.5c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V6l7-2.5zM9 12l2 2 4-4.5",
  lock: "M7.5 11V8a4.5 4.5 0 0 1 9 0v3M6 11h12a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1zM12 14.5v2.5",
  layers: "M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5zM3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  chart: "M4 4v16h16M8 15l3.5-4 3 2.5L19 8",
  chat: "M5 4.5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4.5 4v-4H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z",
  browser: "M4 4.5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM3 9h18M6 6.8h.01M8.5 6.8h.01",
  code: "M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13",
  pen: "M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5 4 20zM13.5 7l3 3",
  cloud: "M7.5 18.5h9.5a4 4 0 0 0 .4-7.98 5.5 5.5 0 0 0-10.65 1.2A3.4 3.4 0 0 0 7.5 18.5z",
  server:
    "M5 4.5h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM5 13.5h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM7.5 7.5h.01M7.5 16.5h.01M11 7.5h5M11 16.5h5",
  offline: "M2.5 8.5a14 14 0 0 1 19 0M5.5 12a9.5 9.5 0 0 1 13 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01M3.5 3.5l17 17",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
