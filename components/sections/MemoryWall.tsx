"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { initGsap, getScroller } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { loadLocalMemories, type LocalMemory } from "@/lib/local-memories";

const MEMORIES = [
  { src: "images/memory-first-day.jpg", caption: "First school day", rotate: "-2deg", gradient: "from-sky-200 to-amber-100" },
  { src: "images/memory-honesty.jpg", caption: "Learning honesty", rotate: "1.5deg", gradient: "from-amber-100 to-stone-300" },
  { src: "images/memory-trips.jpg", caption: "Family trips", rotate: "-1deg", gradient: "from-sky-300 to-emerald-100" },
  { src: "images/memory-festivals.jpg", caption: "Festivals", rotate: "2deg", gradient: "from-rose-200 to-amber-100" },
  { src: "images/memory-hard-work.jpg", caption: "Hard work", rotate: "-1.5deg", gradient: "from-amber-200 to-emerald-200" },
  { src: "images/memory-simple-joys.jpg", caption: "Simple joys", rotate: "1deg", gradient: "from-stone-200 to-sky-100" },
];

export default function MemoryWall() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [mine, setMine] = useState<LocalMemory[]>([]);

  useEffect(() => {
    const reload = () => setMine(loadLocalMemories());
    reload();
    window.addEventListener("buwa:memory-saved", reload);
    return () => window.removeEventListener("buwa:memory-saved", reload);
  }, []);

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".memory-card",
        { y: 60, opacity: 0, scale: 0.94 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".memory-grid", scroller: getScroller(), start: "top 80%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="gallery" data-snap aria-label="Memory wall" className="bg-cream">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-5 py-24">
        <div className="mb-8 flex items-end justify-between">
          <p className="text-[11px] font-semibold tracking-[0.25em]">
            MEMORY WALL <span className="ml-2 inline-block h-[2px] w-8 translate-y-[-3px] bg-maroon" aria-hidden />
          </p>
          <p className="hidden text-[11px] tracking-[0.25em] opacity-50 sm:block">SMALL MOMENTS. BIG LESSONS.</p>
        </div>
        <div className="memory-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((m) => (
            <figure
              key={m.id}
              className="memory-card group bg-white p-2 pb-4 shadow-md transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.03]"
              style={{ rotate: "1deg" }}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-rose-200 to-amber-100">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={`Shared memory by ${m.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <figcaption className="px-2 pt-3 font-hand text-2xl leading-none">
                {m.text.length > 90 ? m.text.slice(0, 90) + "…" : m.text}
              </figcaption>
              <p className="px-2 pt-1 text-xs opacity-60">— {m.name} · shared by you</p>
              <span className="ml-2 mt-1 block h-[2px] w-8 bg-maroon" aria-hidden />
            </figure>
          ))}
          {MEMORIES.map((m) => (
            <figure
              key={m.src}
              className="memory-card group bg-white p-2 pb-4 shadow-md transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.03]"
              style={{ rotate: m.rotate }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.rotate = "0deg";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.rotate = m.rotate;
              }}
            >
              <div className={`aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${m.gradient}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <figcaption className="px-2 pt-3 font-hand text-2xl leading-none">{m.caption}</figcaption>
              <span className="ml-2 mt-1 block h-[2px] w-8 bg-maroon" aria-hidden />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
