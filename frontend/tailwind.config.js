/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#0D1F0F",
        "emerald-glow": "#69F0AE",
        "emerald-bright": "#4CAF50",
      },
    },
  },
  plugins: [],
};
