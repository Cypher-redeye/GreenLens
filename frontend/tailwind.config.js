/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        deep:     "#03070A",
        surface:  "#090F0C",
        elevated: "#0F1A12",

        /* Legacy aliases */
        forest:      "#0D1F0F",
        "forest-dark": "#03070A",

        /* Greens */
        "emerald-glow":   "#69F0AE",
        "emerald-bright": "#4CAF50",
        "neon-green":     "#5EFFA0",

        /* Accent */
        gold: "#F0B429",

        /* Borders */
        "glass-border": "rgba(105, 240, 174, 0.08)",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
