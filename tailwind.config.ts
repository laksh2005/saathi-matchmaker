import type { Config } from "tailwindcss";

// Warm, soft palette: matchmaking is an emotional product, so the internal
// tool borrows the rose and sand tones of the client facing brand.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: { 50: "#fff5f6", 100: "#ffe4e8", 200: "#fecdd5", 400: "#f27a8f", 500: "#e2506b", 600: "#c93853", 700: "#a52a43" },
        sand: { 50: "#fbf8f4", 100: "#f4ede4", 200: "#e8dccb", 400: "#b9a287", 600: "#7d6650", 800: "#3f3226" },
      },
      fontFamily: { serif: ["Georgia", "Cambria", "serif"] },
    },
  },
  plugins: [],
};
export default config;
