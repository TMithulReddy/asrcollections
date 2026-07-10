import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          plum: "#5C1F35",       // text & icons only – too dark for big blocks
          plumSoft: "#7A3350",   // large background areas (hero, etc.)
          rose: "#8C4A5E",
          blush: "#F5E3E6",
          blushDark: "#ECCDD3",
          mauve: "#9C6B57",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair-display)", ...defaultTheme.fontFamily.serif],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
