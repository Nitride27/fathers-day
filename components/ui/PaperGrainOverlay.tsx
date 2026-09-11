"use client";

export default function PaperGrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.5] mix-blend-multiply"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="buwa-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.08" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#buwa-grain)" />
      </svg>
    </div>
  );
}
