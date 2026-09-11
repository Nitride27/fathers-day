import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F3EEE4",
        paper: "#EFE7D6",
        ink: "#2A2622",
        maroon: "#8C1D18",
        maroonDeep: "#6E1410",
        gold: "#C9A227",
        moss: "#4A5240",
      },
      fontFamily: {
        serif: ["Fraunces", "Noto Serif Devanagari", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        hand: ["Caveat", '"Segoe Script"', "cursive"],
        devanagari: ["Noto Serif Devanagari", "Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
