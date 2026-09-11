"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

const KEY = "buwa:muted";
const SRC = "audio/buwa-theme.mp3";

let shared: Howl | null = null;
function getHowl(): Howl | null {
  if (typeof window === "undefined") return null;
  if (!shared) {
    try {
      shared = new Howl({ src: [SRC], loop: true, volume: 0, html5: true });
    } catch {
      return null;
    }
  }
  return shared;
}

export default function MusicToggle() {
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const armed = useRef(false);

  useEffect(() => {
    try {
      setMuted(window.localStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const fadeIn = useCallback(() => {
    if (armed.current) return;
    armed.current = true;
    try {
      if (window.localStorage.getItem(KEY) === "1") return;
      const h = getHowl();
      if (!h) return;
      if (!h.playing()) h.play();
      h.fade(0, 0.35, 2500);
      setMuted(false);
    } catch {
      /* missing audio asset — stay silent, never crash */
    }
  }, []);

  useEffect(() => {
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", fadeIn, opts);
    window.addEventListener("keydown", fadeIn, opts);
    return () => {
      window.removeEventListener("pointerdown", fadeIn);
      window.removeEventListener("keydown", fadeIn);
    };
  }, [fadeIn]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
      const h = getHowl();
      if (!h) return;
      if (next) h.fade(h.volume(), 0, 600);
      else {
        if (!h.playing()) h.play();
        h.fade(h.volume(), 0.35, 1200);
      }
    } catch {
      /* ignore */
    }
  };

  if (!ready) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute music" : "Mute music"}
      className="fixed bottom-5 right-5 z-[85] flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream shadow-lg transition hover:bg-maroon"
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}
