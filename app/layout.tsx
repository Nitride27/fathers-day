import type { Metadata } from "next";
import "./globals.css";

// Fonts load from Google Fonts CDN at runtime (online) so `next build`
// works without network access. Devanagari is a separate family request
// so Latin LCP isn't blocked.
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600&family=Caveat:wght@500;600&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap";

export const metadata: Metadata = {
  title: "BUWA — For the man who taught us how to live",
  description:
    "A warm editorial Father's Day scrollytelling site for Kushe Aunsi. Stories, letters, memory wall, and gratitude for Buwa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS_URL} rel="stylesheet" />
      </head>
      <body className="bg-cream text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
