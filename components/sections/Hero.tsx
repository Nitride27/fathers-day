"use client";

import { useLayoutEffect, useRef } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FlowerIcon } from "@/components/ui/EphemeraIcons";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      // Entrance: per-line stagger.
      gsap.fromTo(
        ".hero-line",
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.14, ease: "power3.out",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 75%", once: true } }
      );
      // HOW TO LIVE letter-spacing settle.
      gsap.fromTo(
        ".hero-accent",
        { letterSpacing: "0.35em", opacity: 0 },
        { letterSpacing: "0.02em", opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.5,
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 75%", once: true } }
      );
      gsap.fromTo(
        ".hero-fade",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power2.out", delay: 0.7,
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 75%", once: true } }
      );
      // Scrub parallax collage.
      gsap.to(".parallax-slow", {
        yPercent: -10, ease: "none",
        scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.to(".parallax-fast", {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="stories" data-snap aria-label="Hero" className="relative overflow-hidden bg-cream">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-10 px-5 py-24 md:grid-cols-2">
        <div>
          <p className="hero-fade mb-4 text-[11px] font-semibold tracking-[0.25em]">
            KUSHE AUNSI • 2083 <span className="ml-2 inline-block h-[2px] w-8 translate-y-[-3px] bg-maroon" aria-hidden />
          </p>
          <h1 className="font-serif font-black leading-[0.95] tracking-tight">
            <span className="hero-line block text-[clamp(2.4rem,6vw,4.5rem)]">FOR THE MAN</span>
            <span className="hero-line block text-[clamp(2.4rem,6vw,4.5rem)]">WHO TAUGHT US</span>
            <span className="hero-accent block text-[clamp(2.4rem,6vw,4.5rem)] text-maroon">HOW TO LIVE</span>
          </h1>
          <p className="hero-fade mt-4 text-[11px] font-semibold tracking-[0.3em] opacity-70">
            A CELEBRATION OF FATHERS
          </p>
          <a
            href="#letters"
            className="hero-fade mt-6 inline-flex items-center gap-3 bg-maroon px-6 py-3 text-[11px] font-bold tracking-[0.2em] text-cream transition hover:bg-maroonDeep active:scale-95"
          >
            EXPLORE STORIES <span aria-hidden>→</span>
          </a>
        </div>

        <div className="relative h-[70vh] min-h-[420px]" aria-label="Photo collage">
          <figure className="parallax-slow polaroid tape absolute left-0 top-0 w-[62%] -rotate-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/hero-main.jpg"               alt="Father walking hand-in-hand with his young son" className="h-auto w-full bg-gradient-to-br from-sky-200 to-amber-100 object-cover" />
          </figure>
          <p className="parallax-fast absolute right-[8%] top-[6%] z-10 max-w-[150px] rotate-3 bg-[#F6E7C9] p-3 font-hand text-xl leading-tight shadow-md">
            बुवा, तपाईं नै हाम्रो शक्ति! <span className="text-maroon">♥</span>
          </p>
          <div aria-hidden className="parallax-fast absolute left-[54%] top-[1%] z-10 -rotate-12 text-maroon">
            <FlowerIcon className="h-16 w-16 drop-shadow-md" />
          </div>
          <figure className="parallax-fast absolute right-0 top-[30%] w-[42%] rotate-2 bg-white p-2 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/hero-village.jpg"               alt="Spinning a prayer wheel at the monastery" className="h-auto w-full bg-gradient-to-br from-stone-300 to-amber-200 object-cover" />
          </figure>
          <figure className="parallax-slow absolute bottom-[22%] right-[10%] w-[46%] -rotate-1 bg-white p-2 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/hero-pagoda.jpg" alt="Pagoda temple draped in prayer flags" className="h-auto w-full bg-gradient-to-br from-emerald-200 to-stone-300 object-cover" />
          </figure>
          <figure className="parallax-fast absolute bottom-0 left-[6%] w-[52%] rotate-1 bg-white p-2 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/hero-mountains.jpg"               alt="Hilltop road above the valley" className="h-auto w-full bg-gradient-to-br from-sky-300 to-indigo-200 object-cover" />
          </figure>
        </div>
      </div>
    </section>
  );
}
