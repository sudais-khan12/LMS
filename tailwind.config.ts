import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // Glassmorphism theme colors
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        background: "#f8fafc",
        foreground: "#0f172a",
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.6)",
          foreground: "#0f172a",
        },
        popover: {
          DEFAULT: "rgba(255, 255, 255, 0.8)",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "rgba(226, 232, 240, 0.8)",
        input: "rgba(226, 232, 240, 0.6)",
        ring: "#3b82f6",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        // Glassmorphism specific colors
        glass: {
          light: "rgba(255, 255, 255, 0.25)",
          medium: "rgba(255, 255, 255, 0.4)",
          strong: "rgba(255, 255, 255, 0.6)",
        },
        sidebar: {
          DEFAULT: "rgba(255, 255, 255, 0.3)",
          foreground: "#0f172a",
          primary: "#3b82f6",
          "primary-foreground": "#ffffff",
          accent: "rgba(255, 255, 255, 0.2)",
          "accent-foreground": "#0f172a",
          border: "rgba(226, 232, 240, 0.3)",
          ring: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "40px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.2)",
        "glass-lg": "0 12px 48px 0 rgba(31, 38, 135, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
