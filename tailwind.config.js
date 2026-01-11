import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      zIndex: {
        30: "30",
        40: "40",
        50: "50",
        60: "60",
      },
      colors: {
        // Override blue color with #155183
        blue: {
          50: "#e6f0f7",
          100: "#cce1ef",
          200: "#99c3df",
          300: "#66a4cf",
          400: "#3386bf",
          500: "#155183", // Primary blue color
          600: "#12456f",
          700: "#0e3a5c",
          800: "#0b2e48",
          900: "#072334",
          950: "#041219",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
