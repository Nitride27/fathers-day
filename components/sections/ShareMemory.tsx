"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getScroller, initGsap } from "@/lib/gsapConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EnvelopeIcon, FlowerIcon, PenIcon, PostcardIcon } from "@/components/ui/EphemeraIcons";
import PostcardModal from "@/components/ui/PostcardModal";
import { downscalePhoto, saveLocalMemory } from "@/lib/local-memories";

export default function ShareMemory() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [postcardOpen, setPostcardOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      // Toss-in cards.
      gsap.fromTo(
        ".toss-card",
        { y: -140, opacity: 0, rotation: (i: number) => (i === 0 ? -14 : 10) },
        {
          y: 0, opacity: 1, rotation: (i: number) => (i === 0 ? -3 : 2),
          duration: 1, stagger: 0.18, ease: "bounce.out",
          scrollTrigger: { trigger: ".toss-zone", scroller: getScroller(), start: "top 75%", once: true },
        }
      );
      // Stamp thump: 0 → 1.15 → 1.
      gsap.fromTo(
        ".stamp",
        { scale: 0, rotation: -18 },
        {
          scale: 1, rotation: -8, duration: 0.7, ease: "power4.out",
          scrollTrigger: { trigger: ".stamp", scroller: getScroller(), start: "top 82%", once: true },
          onComplete: () => {
            gsap.fromTo(".stamp", { scale: 1.15 }, { scale: 1, duration: 0.25, ease: "power2.in" });
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const text = message.trim();
      if (!text) throw new Error("Please write a few words first.");
      // Static hosting: no server — photo is downscaled and the memory is
      // kept in this browser only (localStorage), and shown on the wall below.
      const photoUrl = file ? await downscalePhoto(file) : undefined;
      saveLocalMemory({
        id: crypto.randomUUID(),
        name: name.trim() || "Someone",
        text: text.slice(0, 500),
        photoUrl,
        createdAt: new Date().toISOString(),
      });
      setSent(true);
      window.dispatchEvent(new Event("buwa:memory-saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section ref={root} id="memories" data-snap aria-label="Share your memory" className="relative bg-cream">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-10 px-5 py-24 md:grid-cols-[0.9fr_1.3fr_0.6fr]">
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.25em] opacity-70">SHARE YOUR MEMORY</p>
          <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight">
            Keep their
            <br />
            stories alive.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-75">
            Upload a photo, write a memory, or create a digital postcard for your Buwa. Every story
            matters.
          </p>
          <div className="mt-6 flex gap-6 text-[11px] font-semibold">
            <button type="button" onClick={() => setOpen(true)} className="group flex flex-col items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-maroon group-hover:text-maroon" aria-hidden><PostcardIcon className="h-5 w-5" /></span>
              Upload Photo
            </button>
            <button type="button" onClick={() => setOpen(true)} className="group flex flex-col items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-maroon group-hover:text-maroon" aria-hidden><PenIcon className="h-5 w-5" /></span>
              Write Memory
            </button>
            <button type="button" onClick={() => setPostcardOpen(true)} className="group flex flex-col items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-maroon group-hover:text-maroon" aria-hidden><EnvelopeIcon className="h-5 w-5" /></span>
              Generate Postcard
            </button>
          </div>
        </div>

        <div className="toss-zone relative flex items-start justify-center gap-4">
          <figure className="toss-card polaroid w-[46%] -rotate-3 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/share-memory-postcard.jpg"               alt="Father with his children by the lake" loading="lazy" className="aspect-square w-full bg-gradient-to-br from-sky-200 to-stone-300 object-cover" />
          </figure>
          <figure className="toss-card relative w-[52%] rotate-2 bg-[#FBF4DF] p-5 shadow-xl">
            <p className="font-hand text-2xl leading-snug">
              Dear Buwa,
              <br />
              Thank you for every sacrifice, every lesson, and every silent act of love.
            </p>
            <p className="mt-3 font-hand text-xl opacity-70">— Samridha.</p>
            <span className="stamp absolute -bottom-4 -right-3 grid h-16 w-16 place-items-center rounded-full border-2 border-maroon font-serif text-[10px] font-bold tracking-widest text-maroon" aria-hidden>
              BUWA
              <br />
              2083
            </span>
          </figure>
        </div>

        <div className="relative flex justify-center" aria-hidden>
          <FlowerIcon className="absolute -left-8 top-1/2 h-44 w-44 -translate-y-1/2 text-maroon opacity-10" />
          <figure className="relative w-40 rotate-2 bg-[#FFFDF6] p-2 pb-6 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/share-memory-flower.jpg" alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <figcaption className="px-1 pt-2 font-hand text-xl leading-none text-ink">for Buwa ♥</figcaption>
          </figure>
        </div>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Write a memory" className="fixed inset-0 z-[95] grid place-items-center bg-ink/50 p-4" onClick={() => setOpen(false)}>
          <div className="lined-paper w-full max-w-md bg-[#FDF6E3] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Dear Buwa…</h3>
            {sent ? (
              <p className="mt-4 font-hand text-2xl text-maroon">Thank you — your memory is kept with love, on this device. ♥</p>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-4">
                <label className="block text-xs font-semibold tracking-widest opacity-70">
                  YOUR NAME
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full border border-ink/20 bg-transparent p-2 font-sans text-sm" placeholder="Samridha" />
                </label>
                <label className="block text-xs font-semibold tracking-widest opacity-70">
                  YOUR MEMORY
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} maxLength={500} className="mt-1 w-full border border-ink/20 bg-transparent p-2 font-hand text-xl" placeholder="Thank you for every sacrifice…" />
                </label>
                <label className="block text-xs font-semibold tracking-widest opacity-70">
                  PHOTO (OPTIONAL)
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm normal-case tracking-normal" />
                </label>
                {error && <p role="alert" className="text-sm text-maroon">{error}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="bg-maroon px-5 py-2 text-[11px] font-bold tracking-[0.2em] text-cream hover:bg-maroonDeep disabled:opacity-50 active:scale-95">
                    {saving ? "KEEPING…" : "KEEP THIS STORY"}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-[11px] tracking-[0.2em] opacity-60 hover:opacity-100">
                    CLOSE
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <PostcardModal open={postcardOpen} onClose={() => setPostcardOpen(false)} />
    </section>
  );
}
