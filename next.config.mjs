/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages (no server, no API routes).
  output: "export",
  images: {
    unoptimized: true,
  },
  // Project page: https://nitride27.github.io/fathers-day/
  basePath: "/fathers-day",
  assetPrefix: "/fathers-day/",
};

export default nextConfig;
