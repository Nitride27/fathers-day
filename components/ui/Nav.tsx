"use client";

import { useEffect, useState } from "react";

const EVENT = "buwa:intro-complete";

export default function Nav() {
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setRevealed(true);
    window.addEventListener(EVENT, show);
    // Fallback: never trap nav if intro is skipped / reduced-motion.
    const t = window.setTimeout(show, 6000);
    return () => {
      window.removeEventListener(EVENT, show);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-700 ${
        revealed ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
      >
        <a href="#top" className="shrink-0 font-serif text-xl font-black tracking-tight">
          BUWA<span className="text-maroon">.</span>
          <span className="mt-0.5 block h-[2px] w-8 bg-maroon" aria-hidden />
        </a>
        <ul className="hidden gap-6 text-[11px] font-semibold tracking-[0.18em] sm:flex">
          {[
            ["Stories", "#stories"],
            ["Letters", "#letters"],
            ["Gallery", "#gallery"],
            ["Memories", "#memories"],
            ["About", "#about"],
          ].map(([label, href]) => (
            <li key={href} className="shrink-0">
              <a href={href} className="whitespace-nowrap opacity-70 transition hover:text-maroon hover:opacity-100">
                {label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center text-ink sm:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </nav>
      {open && (
        <div className="border-b border-ink/10 bg-cream/95 backdrop-blur sm:hidden">
          <ul className="flex flex-col gap-1 px-5 py-3 text-xs font-semibold tracking-[0.18em]">
            {[
              ["Stories", "#stories"],
              ["Letters", "#letters"],
              ["Gallery", "#gallery"],
              ["Memories", "#memories"],
              ["About", "#about"],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-2 opacity-70 transition hover:text-maroon hover:opacity-100"
                >
                  {label.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      </nav>
    </header>
  );
}
