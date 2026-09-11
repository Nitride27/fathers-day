import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Singleton GSAP setup — import this module once per client component. */
export function initGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/**
 * The scroll container element for ScrollTrigger's `scroller` option.
 * MUST be resolved via document (global scope): every section runs its
 * tweens inside `gsap.context(fn, rootRef)`, which re-scopes *string*
 * selectors to descendants of that section — and `.buwa-snap` is an
 * ancestor, so `scroller: ".buwa-snap"` finds nothing and ScrollTrigger
 * throws `Cannot read properties of undefined (reading '_gsap')`,
 * blanking the whole page. Passing the element avoids scoping entirely.
 * Call only from client effects (document exists there).
 */
export function getScroller(): Element | Window {
  if (typeof document === "undefined") return typeof window !== "undefined" ? window : (undefined as unknown as Window);
  return document.querySelector(".buwa-snap") ?? window;
}

export { gsap, ScrollTrigger };
