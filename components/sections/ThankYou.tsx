"use client";

import { useLayoutEffect, useRef } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ThankYou() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      // Warm-up: cold/desaturated → warm sunset.
      gsap.fromTo(
        ".sunset-bg",
        { filter: "saturate(0.2) brightness(0.6)" },
        {
          filter: "saturate(1.25) brightness(1.02)", ease: "none",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top bottom", end: "center center", scrub: 1 },
        }
      );
      // Word drop.
      gsap.fromTo(
        ".thanks-word",
        { y: -60, opacity: 0, rotation: -4 },
        {
          y: 0, opacity: 1, rotation: 0, duration: 0.9, stagger: 0.12, ease: "bounce.out",
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 60%", once: true },
        }
      );
      // Mouse parallax.
      const xTo = gsap.quickTo(".parallax-layer", "x", { duration: 0.6, ease: "power2.out" });
      const yTo = gsap.quickTo(".parallax-layer", "y", { duration: 0.6, ease: "power2.out" });
      const el = root.current;
      const onMove = (e: MouseEvent) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 24);
        yTo(((e.clientY - r.top) / r.height - 0.5) * 16);
      };
      el?.addEventListener("mousemove", onMove);
      return () => el?.removeEventListener("mousemove", onMove);
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} data-snap aria-label="Thank you Buwa" className="relative overflow-hidden bg-[#3D0E0B]">
      <div className="sunset-bg absolute inset-0 bg-gradient-to-b from-[#7A1E12] via-[#B23A1D] to-[#2A0F0C]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="images/thank-you-sunset-v2.jpg"
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" aria-hidden />
      </div>

      <div className="parallax-layer relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 text-cream">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.3em] opacity-80">BUWA.</p>
        <h2 className="font-serif font-black leading-[0.9]">
          <span className="thanks-word inline-block text-[clamp(2.6rem,7vw,5.5rem)]">THANK&nbsp;</span>
          <span className="thanks-word inline-block text-[clamp(2.6rem,7vw,5.5rem)]">YOU,&nbsp;</span>
          <span className="thanks-word inline-block text-[clamp(2.6rem,7vw,5.5rem)]">BUWA.</span>
        </h2>
        <div className="mt-4 flex items-end justify-between">
          <p className="max-w-xs font-hand text-2xl opacity-90">Different paths. Same love.</p>
          <p className="text-right text-[10px] tracking-[0.3em] opacity-70">
            KUSHE
            <br />
            AUNSI
            <br />
            2083
          </p>
        </div>
      </div>
    </section>
  );
}
