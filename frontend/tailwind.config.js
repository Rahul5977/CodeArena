/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Modern Slate + Teal Theme
        brand: {
          primary: "#14B8A6", // Teal-500
          secondary: "#22D3EE", // Cyan-400
          accent: "#06B6D4", // Cyan-500
          dark: "#0F172A", // Slate-900
          darker: "#020617", // Slate-950
          light: "#F1F5F9", // Slate-100
          lighter: "#F8FAFC", // Slate-50
        },
        // Semantic colors for dark theme
        dark: {
          bg: {
            primary: "#0F172A", // Slate-900
            secondary: "#1E293B", // Slate-800
            tertiary: "#334155", // Slate-700
            hover: "#475569", // Slate-600
          },
          text: {
            primary: "#E2E8F0", // Slate-200
            secondary: "#CBD5E1", // Slate-300
            tertiary: "#94A3B8", // Slate-400
            muted: "#64748B", // Slate-500
          },
          border: {
            DEFAULT: "#334155", // Slate-700
            light: "#475569", // Slate-600
            dark: "#1E293B", // Slate-800
          },
        },
        // Semantic colors for light theme
        light: {
          bg: {
            primary: "#FFFFFF",
            secondary: "#F8FAFC", // Slate-50
            tertiary: "#F1F5F9", // Slate-100
            hover: "#E2E8F0", // Slate-200
          },
          text: {
            primary: "#0F172A", // Slate-900
            secondary: "#334155", // Slate-700
            tertiary: "#475569", // Slate-600
            muted: "#64748B", // Slate-500
          },
          border: {
            DEFAULT: "#E2E8F0", // Slate-200
            light: "#F1F5F9", // Slate-100
            dark: "#CBD5E1", // Slate-300
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Rubik", "Inter", "sans-serif"],
        mono: ["Fira Code", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(20, 184, 166, 0.3)",
        "glow-md": "0 0 20px rgba(20, 184, 166, 0.4)",
        "glow-lg": "0 0 30px rgba(20, 184, 166, 0.5)",
        "dark-sm": "0 2px 4px rgba(0, 0, 0, 0.3)",
        "dark-md": "0 4px 12px rgba(0, 0, 0, 0.4)",
        "dark-lg": "0 8px 24px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        leetlab: {
          // Dark theme with Slate + Teal
          primary: "#14B8A6", // Teal-500
          secondary: "#22D3EE", // Cyan-400
          accent: "#06B6D4", // Cyan-500
          neutral: "#1E293B", // Slate-800
          "base-100": "#0F172A", // Slate-900 (main bg)
          "base-200": "#1E293B", // Slate-800 (secondary bg)
          "base-300": "#334155", // Slate-700 (tertiary bg)
          "base-content": "#E2E8F0", // Slate-200 (main text)
          info: "#22D3EE", // Cyan-400
          success: "#34D399", // Green-400
          warning: "#FBBF24", // Amber-400
          error: "#F87171", // Red-400
        },
        leetlabLight: {
          // Light theme with soft grays + blue tones
          primary: "#0891B2", // Cyan-600
          secondary: "#06B6D4", // Cyan-500
          accent: "#14B8A6", // Teal-500
          neutral: "#F1F5F9", // Slate-100
          "base-100": "#FFFFFF", // White (main bg)
          "base-200": "#F8FAFC", // Slate-50 (secondary bg)
          "base-300": "#F1F5F9", // Slate-100 (tertiary bg)
          "base-content": "#0F172A", // Slate-900 (main text)
          info: "#0EA5E9", // Sky-500
          success: "#10B981", // Green-500
          warning: "#F59E0B", // Amber-500
          error: "#EF4444", // Red-500
        },
      },
    ],
    darkTheme: "leetlab",
    base: true,
    styled: true,
    utils: true,
  },
};
