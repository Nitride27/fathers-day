// Hand-drawn style stroke icons for the BUWA scrapbook look.
// All inherit `currentColor`, 24x24 viewBox, 1.8px stroke to match the mockup's ink doodles.

type P = { className?: string };

function Base({ className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function FlowerIcon({ className }: P) {
  return (
    <Base className={className}>
      <circle cx="12" cy="10" r="2.6" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="12" cy="5" rx="2" ry="3.4" transform={`rotate(${a} 12 10)`} />
      ))}
      <path d="M12 15.5 V21 M12 18.5 C10 18.5 8.5 17.5 8 16" />
    </Base>
  );
}

export function MountainIcon({ className }: P) {
  return (
    <Base className={className}>
      <circle cx="17.5" cy="5.5" r="1.8" />
      <path d="M2.5 19.5 9 8l3.5 5.5L15 10l6.5 9.5Z" />
      <path d="M9 8l1.8 2.8L9.4 12.4 7.6 11 9 8Z" fill="currentColor" stroke="none" opacity="0.35" />
    </Base>
  );
}

export function TempleIcon({ className }: P) {
  return (
    <Base className={className}>
      <path d="M12 2.5 3.5 9h17L12 2.5Z" />
      <path d="M5.5 13.5 12 9l6.5 4.5" />
      <path d="M8.5 13.5V19M15.5 13.5V19M6 19.5h12M12 2.5V1.5" />
    </Base>
  );
}

export function EnvelopeIcon({ className }: P) {
  return (
    <Base className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Base>
  );
}

export function PenIcon({ className }: P) {
  return (
    <Base className={className}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
      <path d="m14.5 6.5 3 3" />
    </Base>
  );
}

export function PostcardIcon({ className }: P) {
  return (
    <Base className={className}>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="m3 15 5-4 3.5 3 3-2.5L21 16" />
      <rect x="16.3" y="8" width="2.7" height="3.2" strokeDasharray="1.2 1" />
    </Base>
  );
}

export function GiftIcon({ className }: P) {
  return (
    <Base className={className}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="1" />
      <path d="M3.5 7h17M12 7v13.5" />
      <path d="M12 7C10 7 8.2 6.4 8.2 4.8c0-1 .9-1.6 1.8-1.2L12 7Zm0 0c2 0 3.8-.6 3.8-2.2 0-1-.9-1.6-1.8-1.2L12 7Z" />
    </Base>
  );
}
