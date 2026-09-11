"use client";

import { useLayoutEffect, useRef } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EnvelopeIcon, GiftIcon, MountainIcon, TempleIcon } from "@/components/ui/EphemeraIcons";

const ROWS = [
  { title: "THE TRADITION", body: "Families gather, offer prayers, and remember their fathers with love.", Icon: TempleIcon },
  { title: "THE IMPORTANCE", body: "Fathers are the pillars of Nepali families — providing guidance, protection and values that last a lifetime.", Icon: MountainIcon },
  { title: "FAMILY GATHERINGS", body: "Shared meals, stories and laughter bring generations together.", Icon: EnvelopeIcon },
  { title: "BLESSINGS AND GIFTS", body: "Children offer blessings, flowers and gifts to their fathers, expressing love and respect.", Icon: GiftIcon },
];

export default function KusheAunsiBand() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      // Infinite yoyo Ken Burns on the pagoda image.
      gsap.fromTo(
        ".kenburns",
        { scale: 1 },
        { scale: 1.12, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      // Blur-to-sharp Nepali title.
      gsap.fromTo(
        ".nepali-title",
        { filter: "blur(10px)", opacity: 0 },
        {
          filter: "blur(0px)", opacity: 1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 70%", once: true },
        }
      );
      // Row stagger.
      gsap.fromTo(
        ".kushe-row",
        { x: 40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: "power3.out",
          scrollTrigger: { trigger: ".kushe-rows", scroller: getScroller(), start: "top 78%", once: true },
        }
      );
      gsap.fromTo(
        ".kushe-head",
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 75%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="about" data-snap aria-label="Kushe Aunsi tradition" className="bg-[#141110] text-cream">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-8 px-5 py-24 md:grid-cols-[0.9fr_1.2fr_0.9fr]">
        <div className="kushe-head">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] opacity-70">
            OUR TRADITION <span className="ml-2 inline-block h-[2px] w-8 translate-y-[-3px] bg-maroon" aria-hidden />
          </p>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-none">KUSHE AUNSI</h2>
          <p className="nepali-title mt-2 font-devanagari text-[clamp(1.4rem,3vw,2rem)] opacity-90">कुशे औंसी</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-75">
            Kushe Aunsi is a sacred day in Nepal when we remember and honor our fathers. It is a time
            to express gratitude, seek blessings, and celebrate their lifelong sacrifices.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm shadow-2xl">
          <div className="kenburns aspect-[4/3] w-full bg-gradient-to-br from-orange-900 via-stone-800 to-amber-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="images/kushe-aunsi-pagoda-sunset.jpg"
              alt="Pagoda temple at sunset with prayer flags and mountains"
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
        </div>

        <ul className="kushe-rows space-y-6">
          {ROWS.map((r) => (
            <li key={r.title} className="kushe-row flex gap-4">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-maroon/60 text-maroon" aria-hidden>
                <r.Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em]">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed opacity-70">{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
