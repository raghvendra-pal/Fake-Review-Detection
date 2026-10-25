import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05080F",
          900: "#070B14",
          850: "#0B1220",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155",
        },
        navy: {
          900: "#0A0F1D",
          800: "#0D1527",
          700: "#131E35",
          600: "#1B2A4A",
          500: "#24375F",
        },
        trust: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          glow: "#34D399",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          glow: "#FBBF24",
        },
        threat: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          glow: "#F87171",
        },
        electric: {
          cyan: "#06B6D4",
          blue: "#3B82F6",
          indigo: "#6366F1",
          violet: "#8B5CF6",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Space Grotesk", "Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-flow": "glowFlow 4s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowFlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        }
      },
      boxShadow: {
        "glow-trust": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "glow-threat": "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        "glow-warning": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
        "glow-cyan": "0 0 30px -5px rgba(6, 182, 212, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }
    },
  },
  plugins: [],
};

export default config;
