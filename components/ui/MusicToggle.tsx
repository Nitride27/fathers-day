"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "buwa:muted";
const SRC = "audio/buwa-theme.mp3";
const TARGET_VOLUME = 0.35;

/**
 * Plain <audio> element instead of Howler: deterministic across the
 * autoplay-blocked → gesture-unlock lifecycle. Volume always ramps from
 * the element's real current volume, so it can never get stuck silent.
 */
export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rampRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  const rampTo = useCallback((to: number, ms = 1200) => {
    const el = audioRef.current;
    if (!el) return;
    if (rampRef.current) window.clearInterval(rampRef.current);
    const from = el.volume;
    if (from === to) return;
    const steps = 20;
    let i = 0;
    rampRef.current = window.setInterval(() => {
      i += 1;
      const done = i >= steps;
      el.volume = done ? to : from + ((to - from) * i) / steps;
      if (done && rampRef.current) {
        window.clearInterval(rampRef.current);
        rampRef.current = null;
      }
    }, ms / steps);
  }, []);

  const startAudible = useCallback(() => {
    const el = audioRef.current;
    if (!el) return false;
    try {
      if (window.localStorage.getItem(KEY) === "1") return false;
    } catch {
      /* ignore */
    }
    el.volume = 0;
    const p = el.play();
    const onPlay = () => {
      rampTo(TARGET_VOLUME, 2000);
      setMuted(false);
    };
    if (p && typeof p.then === "function") {
      p.then(onPlay).catch(() => {
        /* blocked — a later gesture will retry */
      });
      return true;
    }
    onPlay();
    return true;
  }, [rampTo]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (window.localStorage.getItem(KEY) === "1") {
        setMuted(true);
        setReady(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setReady(true);
    startAudible(); // attempt immediate playback; falls back to gesture
  }, [startAudible]);

  useEffect(() => {
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const unlock = () => startAudible();
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("touchend", unlock, opts);
    window.addEventListener("scroll", unlock, opts);
    const onVis = () => {
      if (document.visibilityState === "visible") startAudible();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("scroll", unlock);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [startAudible]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (muted) {
      try {
        window.localStorage.setItem(KEY, "0");
      } catch {
        /* ignore */
      }
      el.volume = 0;
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          rampTo(TARGET_VOLUME);
          setMuted(false);
        }).catch(() => {
          /* still blocked — stays muted */
        });
      } else {
        rampTo(TARGET_VOLUME);
        setMuted(false);
      }
    } else {
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      if (rampRef.current) window.clearInterval(rampRef.current);
      el.pause();
      setMuted(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="auto" />
      {ready ? (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute music" : "Mute music"}
          className="fixed bottom-5 right-5 z-[85] flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream shadow-lg transition hover:bg-maroon active:scale-95"
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
      ) : null}
    </>
  );
}
