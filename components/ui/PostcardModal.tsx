"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const W = 1200;
const H = 800;
const BG_SRC = "images/hero-mountains-v2.jpg?v=2";
const CREAM = "#F3EEE4";
const INK = "#2A2622";
const MAROON = "#8C1D18";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = words[0];
    for (const word of words.slice(1)) {
      const trial = line + " " + word;
      if (ctx.measureText(trial).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = trial;
      }
    }
    lines.push(line);
  }
  return lines;
}

export default function PostcardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Thank you for every sacrifice, every lesson, and every silent act of love.");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !open) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      await document.fonts.ready;
    } catch {
      /* fall back to system fonts */
    }
    try {
      const bg = await loadImage(BG_SRC);
      drawCover(ctx, bg, 0, 0, W, H);
    } catch {
      ctx.fillStyle = "#7A1E12";
      ctx.fillRect(0, 0, W, H);
    }

    // Eyebrow over the photo.
    ctx.fillStyle = "rgba(20,12,8,0.45)";
    ctx.fillRect(0, 0, W, 120);
    ctx.fillStyle = CREAM;
    ctx.font = "600 26px Inter, system-ui, sans-serif";
    ctx.fillText("K U S H E   A U N S I   •   2 0 8 3", 80, 72);

    // Optional user photo as a small polaroid.
    if (photoUrl) {
      try {
        const photo = await loadImage(photoUrl);
        ctx.fillStyle = "#FFFDF6";
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.fillRect(868, 150, 252, 300);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.save();
        ctx.beginPath();
        ctx.rect(880, 162, 228, 228);
        ctx.clip();
        drawCover(ctx, photo, 880, 162, 228, 228);
        ctx.restore();
        ctx.fillStyle = INK;
        ctx.font = "500 26px Caveat, cursive";
        ctx.fillText("us ♥", 890, 428);
      } catch {
        /* photo failed — card still renders */
      }
    }

    // Cream letter band.
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 480, W, H - 480);
    ctx.fillStyle = MAROON;
    ctx.fillRect(80, 512, 64, 4);
    ctx.fillStyle = INK;
    ctx.font = "600 44px Fraunces, Georgia, serif";
    ctx.fillText("Dear Buwa,", 80, 580);
    ctx.font = "500 40px Caveat, cursive";
    const lines = wrapLines(ctx, message || "…", 1040).slice(0, 4);
    lines.forEach((line, i) => ctx.fillText(line, 80, 636 + i * 50));
    ctx.font = "italic 600 34px Fraunces, Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText(name ? `— ${name}` : "—", 1120, 748);
    ctx.textAlign = "left";
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = MAROON;
    ctx.fillText("B U W A .", 80, 748);
  }, [message, name, open, photoUrl]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!open) {
      setBusy(false);
    }
  }, [open ]);

  if (!open) return null;

  const onPhoto = (f: File | undefined) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024) return;
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await draw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "buwa-postcard.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Generate postcard" className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-ink/60 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-[#FDF6E3] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-2xl">Generate postcard</h3>
        <p className="mt-1 text-sm opacity-70">Rendered on the Himalayan artwork. Download it, print it, or send it to Buwa.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <label className="block text-xs font-semibold tracking-widest opacity-70">
              YOUR NAME
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Samridha" className="mt-1 w-full border border-ink/20 bg-transparent p-2 font-sans text-sm" />
            </label>
            <label className="block text-xs font-semibold tracking-widest opacity-70">
              MESSAGE
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={220} rows={4} className="mt-1 w-full border border-ink/20 bg-transparent p-2 font-hand text-xl" />
            </label>
            <label className="block text-xs font-semibold tracking-widest opacity-70">
              PHOTO (OPTIONAL)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPhoto(e.target.files?.[0])} className="mt-1 w-full text-sm normal-case tracking-normal" />
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={download} disabled={busy} className="bg-maroon px-5 py-2 text-[11px] font-bold tracking-[0.2em] text-cream hover:bg-maroonDeep disabled:opacity-50 active:scale-95">
                {busy ? "MAKING…" : "DOWNLOAD PNG"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 text-[11px] tracking-[0.2em] opacity-60 hover:opacity-100">
                CLOSE
              </button>
            </div>
          </div>
          <div>
            <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-sm shadow-lg" aria-label="Postcard preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
