"use client";

import { useEffect, useState } from "react";

const EVENT = "buwa:intro-complete";

export default function Nav() {
  const [revealed, setRevealed] = useState(false);

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
        <a href="#top" className="font-serif text-xl font-black tracking-tight">
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
            <li key={href}>
              <a href={href} className="opacity-70 transition hover:text-maroon hover:opacity-100">
                {label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#memories"
          className="sm:hidden text-[11px] font-semibold tracking-[0.18em] opacity-70"
        >
          MEMORIES
        </a>
      </nav>
    </header>
  );
}
