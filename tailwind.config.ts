import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1180px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#18100f",
        charcoal: "#211816",
        burgundy: {
          50: "#fff3f3",
          100: "#f9d5d7",
          500: "#8f1726",
          700: "#5d0d18",
          900: "#31070d",
        },
        saffron: {
          100: "#ffe9b3",
          300: "#f7c766",
          500: "#d5962b",
          700: "#9b6217",
        },
        leaf: "#26765a",
        smoke: "#f5f2ec",
      },
      boxShadow: {
        lift: "0 18px 45px rgba(40, 12, 12, 0.16)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
