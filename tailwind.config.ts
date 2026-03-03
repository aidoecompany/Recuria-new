import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["DM Serif Display", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#f0f7e8",
          100: "#dbefc4",
          200: "#c8e6a0",
          300: "#a8d870",
          400: "#82c440",
          500: "#5a8a3a",
          600: "#4a7a2a",
          700: "#3a6a1a",
          800: "#2a5a0a",
          900: "#1a4a00",
        },
        surface: "#f8f8f6",
        "surface-elevated": "#ffffff",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        card: "0 2px 12px rgba(0,0,0,0.06)",
        input: "0 2px 20px rgba(0,0,0,0.08), 0 0 0 3px rgba(90,138,58,0.08)",
      },
      animation: {
        "fade-up": "fadeUp 0.3s cubic-bezier(0.4,0,0.2,1)",
        "typing-bounce": "typingBounce 1.2s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typingBounce: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-5px)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
