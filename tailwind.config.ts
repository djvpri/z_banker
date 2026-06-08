// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:    "#c8a96e",
        "gold-dim": "#8a6030",
        banker: {
          bg:     "#080810",
          card:   "#0e0e18",
          deep:   "#0d0d14",
          border: "#1a1a2e",
        },
      },
      fontFamily: {
        sans: ["'Segoe UI'", "system-ui", "sans-serif"],
        mono: ["'Courier New'", "monospace"],
      },
      animation: {
        "slide-in":   "slideIn 0.25s ease",
        "slide-up":   "slideUp 0.3s ease",
        "gold-shine": "goldShimmer 3s linear infinite",
        "coin-float": "coinFloat 0.8s ease forwards",
      },
      keyframes: {
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        goldShimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        coinFloat: {
          "0%":   { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-40px) scale(0.8)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
