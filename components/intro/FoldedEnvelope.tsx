"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FlowerIcon, MountainIcon } from "@/components/ui/EphemeraIcons";

const EVENT = "buwa:intro-complete";

function dispatchComplete() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Pinned CSS-3D envelope unfold.
 * Desktop: twine dashoffset → rotateY L/R → rotateX top/bottom → fade.
 * Mobile (<=768px): 2D fade/slide only — no heavy perspective.
 * Reduced motion: static final state, event fires immediately.
 */
export default function FoldedEnvelope() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (reduced) {
      dispatchComplete();
      return;
    }
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    // Mobile gets stacked snap cards with NO pin, so mandatory snap keeps
    // working (one scroll = one card). Only desktop disables snap for pinning.
    if (mobile) {
      const sc = getScroller();
      if (sc instanceof HTMLElement) sc.classList.remove("no-snap");
    } else {
      const scrollerEl = getScroller();
      if (scrollerEl instanceof HTMLElement) scrollerEl.classList.add("no-snap");
    }
    const { gsap, ScrollTrigger } = initGsap();
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current);
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const twine = q(".twine-path")[0] as unknown as SVGPathElement | undefined;

      if (twine) {
        const len = twine.getTotalLength();
        gsap.set(twine, { strokeDasharray: len, strokeDashoffset: len });
      }

      // While the intro pin owns the scroll range, mandatory snap on the
      // scroller would jump past the (snap-less) pin spacer to Hero.
      // Toggle it off for the pin's active range, restore after.
      // NOTE: element comes from getScroller() — never a string selector
      // (string scoping inside gsap.context blanks the page, see lib/gsapConfig.ts).
      const setSnap = (active: boolean) => {
        const sc = getScroller();
        if (sc instanceof HTMLElement) sc.classList.toggle("no-snap", active);
      };
      const syncSnap = (self: { isActive: boolean }) => setSnap(self.isActive);

      if (isMobile) {
        // Mobile: NO pin (pin + touch snap fight and break). Three stacked
        // snap cards animate in on enter; targets are document-selected
        // elements so context scoping can't hide them.
        const cards = Array.from(document.querySelectorAll(".mobile-card"));
        cards.forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                scroller: getScroller(),
                start: "top 80%",
                once: true,
                onEnter: () => {
                  if (i === cards.length - 1) dispatchComplete();
                },
              },
            }
          );
        });
        if (cards.length === 0) dispatchComplete();
        return () => {
          const sc = getScroller();
          if (sc instanceof HTMLElement) sc.classList.remove("no-snap");
        };
      }

      // Desktop CSS-3D fold.
      gsap.set(".fold-stage", { transformPerspective: 1400 });
      gsap.set(".fold-left", { transformOrigin: "left center" });
      gsap.set(".fold-right", { transformOrigin: "right center" });
      gsap.set(".fold-top", { transformOrigin: "center top" });
      gsap.set(".fold-bottom", { transformOrigin: "center bottom" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          scroller: getScroller(),
          start: "top top",
          end: "+=250%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onLeave: dispatchComplete,
          onToggle: syncSnap,
          onRefresh: syncSnap,
        },
      });

      tl.to(".twine-path", { strokeDashoffset: 0, duration: 0.8, ease: "none" }, 0);
      tl.to(".twine-wrap", { opacity: 0, scale: 1.2, duration: 0.4 }, 0.7);
      tl.to(".fold-left", { rotationY: -155, duration: 1, ease: "power2.inOut" }, 0.8);
      tl.to(".fold-right", { rotationY: 155, duration: 1, ease: "power2.inOut" }, 0.9);
      tl.to(".fold-top", { rotationX: -150, duration: 1, ease: "power2.inOut" }, 1.6);
      tl.to(".fold-bottom", { rotationX: 150, duration: 1, ease: "power2.inOut" }, 1.7);
      tl.fromTo(
        ".fold-final",
        { opacity: 0, scale: 0.85, rotationX: 8 },
        { opacity: 1, scale: 1, rotationX: 0, duration: 0.9, ease: "power2.out" },
        2.2
      );
      tl.to(".fold-flap", { opacity: 0, duration: 0.5 }, 2.4);
      tl.to(".fold-hint", { opacity: 0, duration: 0.3 }, 2.6);
      tl.add(dispatchComplete, 2.9);

      return () => {
        setSnap(false);
        tl.scrollTrigger?.kill();
        tl.kill();
        ScrollTrigger.refresh();
      };
    }, root);
    return () => {
      ctx.revert();
      const sc = getScroller();
      if (sc instanceof HTMLElement) sc.classList.remove("no-snap");
    };
  }, [reduced, isMobile]);

  if (reduced) {
    return (
      <div data-snap className="relative flex min-h-[100dvh] items-center justify-center bg-cream px-6">
        <figure className="polaroid tape max-w-md rotate-1 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="images/fold-final.jpg?v=2" alt="Open letter of gratitude for Buwa" className="h-auto w-full object-cover" />
          <figcaption className="px-2 py-3 font-hand text-2xl text-ink">
            A lifetime of love, folded in moments.
          </figcaption>
        </figure>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <div data-snap className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-cream px-6 py-16">
          <div className="mobile-card grid w-full max-w-xs place-items-center rounded-sm bg-paper px-6 py-14 shadow-[0_24px_60px_rgba(42,38,34,0.25)]">
            <span className="font-serif text-2xl tracking-[0.3em] opacity-40">BUWA</span>
            <span className="mt-2 text-[11px] uppercase tracking-[0.25em] text-maroon">tied with love</span>
          </div>
          <p className="font-hand text-xl">A lifetime of love, folded in moments.</p>
          <p className="text-[11px] font-semibold tracking-[0.3em] opacity-60">SCROLL ↓</p>
        </div>
        <div data-snap className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-cream px-6 py-16">
          <div className="mobile-card w-full max-w-xs rounded-sm bg-[#EADFC6] p-6 text-center shadow-xl">
            <FlowerIcon className="mx-auto h-8 w-8 text-maroon" />
            <p className="mt-2 font-hand text-2xl">Dad — thank you for everything</p>
          </div>
          <div className="mobile-card w-full max-w-xs rounded-sm bg-[#E4D5B4] p-6 text-center shadow-xl">
            <MountainIcon className="mx-auto h-8 w-8 opacity-60" />
            <p className="mt-2 font-serif text-sm tracking-[0.25em] opacity-60">KUSHE AUNSI • 2083</p>
          </div>
        </div>
        <div data-snap className="relative flex min-h-[100dvh] items-center justify-center bg-cream px-6 py-16">
          <figure className="mobile-card polaroid tape w-full max-w-xs rotate-1 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/fold-final.jpg?v=2" alt="Open letter of gratitude for Buwa" className="h-auto w-full object-cover" />
            <figcaption className="px-2 py-3 font-hand text-2xl">Same mountains, new dreams. Thank you, Buwa.</figcaption>
          </figure>
        </div>
      </>
    );
  }

  return (
    <div ref={root} data-snap className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-cream">
      <p className="absolute left-6 top-24 hidden max-w-[140px] -rotate-6 font-hand text-xl leading-tight md:block">
        A lifetime of love, folded in moments.
      </p>

      <div className="fold-stage relative h-[64vmin] w-[90vmin] max-w-[880px]">
        {/* sealed base */}
        <div className="fold-sealed absolute inset-0 grid place-items-center rounded-sm bg-paper shadow-[0_24px_60px_rgba(42,38,34,0.25)]">
          <span className="font-serif text-2xl tracking-[0.3em] opacity-40">BUWA</span>
        </div>

        {/* twine */}
        <div className="twine-wrap absolute inset-0 z-20 grid place-items-center">
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
            <path
              className="twine-path"
              d="M100 10 C 60 60, 140 90, 100 140 S 60 180, 100 190 M20 100 H180 M100 20 V180"
              fill="none"
              stroke="#8C1D18"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="9" fill="#8C1D18" />
            <circle cx="100" cy="100" r="5" fill="#B1342B" />
          </svg>
        </div>

        {/* 4 flaps */}
        <div className="fold-flap fold-left fold-panel absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden rounded-sm bg-[#E7DCC3] shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="images/fold-panel-a.jpg?v=2" alt="" aria-hidden className="h-full w-full object-cover object-top opacity-90" />
        </div>
        <div className="fold-flap fold-right fold-panel absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden rounded-sm bg-[#EFE3C8] shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="images/fold-panel-b.jpg" alt="" aria-hidden className="h-full w-full object-cover object-center opacity-90" />
        </div>
        <div className="fold-flap fold-top fold-panel absolute inset-x-0 top-0 z-10 flex h-1/2 flex-col items-center justify-center gap-2 overflow-hidden bg-[#EADFC6] px-6 text-center">
          <FlowerIcon className="h-8 w-8 text-maroon" />
          <span className="font-hand text-2xl md:text-3xl">Dad — thank you for everything</span>
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">folded with love</span>
        </div>
        <div className="fold-flap fold-bottom fold-panel absolute inset-x-0 bottom-0 z-10 flex h-1/2 flex-col items-center justify-center gap-2 overflow-hidden bg-[#E4D5B4] px-6 text-center">
          <MountainIcon className="h-8 w-8 opacity-60" />
          <span className="font-serif text-sm tracking-[0.25em] opacity-60">KUSHE AUNSI • 2083</span>
        </div>

        {/* final reveal */}
        <figure className="fold-final absolute inset-0 z-0 grid place-items-center opacity-0">
          <div className="polaroid tape w-[86%] rotate-1 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/fold-final.jpg?v=2" alt="Open letter of gratitude for Buwa" className="h-auto w-full object-cover" />
            <figcaption className="px-2 py-3 font-hand text-2xl">Same mountains, new dreams. Thank you, Buwa.</figcaption>
          </div>
        </figure>
      </div>

      <div className="fold-hint absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[11px] font-semibold tracking-[0.3em] opacity-60">SCROLL TO UNFOLD</span>
        <span className="block h-8 w-px animate-pulse bg-ink/60" aria-hidden />
      </div>
    </div>
  );
}
