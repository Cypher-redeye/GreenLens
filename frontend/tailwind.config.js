/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#0D1F0F",
        "forest-dark": "#040A05",
        "emerald-glow": "#69F0AE",
        "emerald-bright": "#4CAF50",
        "neon-green": "#00FF66",
        "glass-border": "rgba(105, 240, 174, 0.15)",
        "glass-bg": "rgba(13, 31, 15, 0.6)",
      },
    },
  },
  plugins: [],
};
