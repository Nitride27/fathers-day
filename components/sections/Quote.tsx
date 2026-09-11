"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
const QUOTE = "A father is not just someone who raises us. He is the quiet strength behind every dream.";

export default function Quote() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const words = useMemo(() => QUOTE.split(" "), []);

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".quote-word",
        { opacity: 0.14 },
        {
          opacity: 1, stagger: 0.06, ease: "none",
          scrollTrigger: { trigger: ".quote-text", scroller: getScroller(), start: "top 80%", end: "bottom 45%", scrub: 1 },
        }
      );
      const path = root.current?.querySelector(".mountain-path") as SVGPathElement | null;
      if (path) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0, ease: "none",
            scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 70%", end: "bottom 60%", scrub: 1 },
          }
        );
      }
      gsap.fromTo(
        ".quote-scrawl",
        { opacity: 0, y: 14, rotate: -4 },
        {
          opacity: 1, y: 0, rotate: -6, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 40%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="letters" data-snap aria-label="Their impact" className="relative bg-cream">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 content-center gap-10 px-5 py-24 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] opacity-70">THEIR IMPACT</p>
          <blockquote className="quote-text font-serif text-[clamp(1.6rem,3.4vw,2.6rem)] leading-snug">
            <span aria-hidden className="mr-1 text-3xl">“</span>
            {words.map((w, i) => {
              const accent = w === "quiet" || w === "strength";
              return (
                <span key={i} className={`quote-word ${accent ? "text-maroon" : ""}`}>
                  {w}{" "}
                </span>
              );
            })}
            <span aria-hidden className="text-3xl">”</span>
          </blockquote>
        </div>
        <div className="relative border-l border-ink/15 pl-6">
          <p className="max-w-xs text-sm leading-relaxed opacity-80">
            From teaching us to ride a bicycle, to standing silently beside us in difficult times, our
            fathers shape generations.
          </p>
          <p className="quote-scrawl mt-6 inline-block font-hand text-2xl text-maroon">
            Not just a father,
            <br />
            but a foundation.
          </p>
          <svg viewBox="0 0 400 120" className="mt-6 w-full opacity-70" aria-hidden>
            <path
              className="mountain-path"
              d="M10 100 L110 30 L160 70 L220 20 L290 80 L330 55 L390 100"
              fill="none"
              stroke="#2A2622"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M90 105 L150 60 L210 105 M230 105 L280 65 L340 105" fill="none" stroke="#2A2622" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
