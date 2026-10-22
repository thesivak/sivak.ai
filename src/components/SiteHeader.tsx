"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { BrandLogo } from "@/components/Logo";
import Icon from "@/components/Icon";

type Props = {
  nav: Dictionary["nav"];
  langSwitch: Dictionary["langSwitch"];
  homeHref: string;
  ctaHref: string;
  switchHref: string;
  switchLang: string;
};

export default function SiteHeader({ nav, langSwitch, homeHref, ctaHref, switchHref, switchLang }: Props) {
  const [open, setOpen] = useState(false);

  // The mobile menu closes on Escape and when the window grows back to the desktop layout
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1081px)");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onWiden = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWiden);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWiden);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="container header-inner">
        <a className="header-logo" href={homeHref} aria-label={nav.home}>
          <BrandLogo />
        </a>

        <nav className="header-nav" id="site-nav" aria-label={nav.label}>
          <ul className="header-links">
            {nav.items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="header-actions">
            <a className="lang-link" href={switchHref} hrefLang={switchLang} lang={switchLang} title={langSwitch.title}>
              {langSwitch.label}
            </a>
            <a className="btn btn-light btn-sm" href={ctaHref} onClick={close}>
              {nav.cta}
            </a>
          </div>
        </nav>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? nav.close : nav.open}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}
