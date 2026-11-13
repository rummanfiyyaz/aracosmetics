/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Georgia",
          "ui-serif",
          "Times New Roman",
          "serif",
        ],
      },
      colors: {
        brand: {
          50: "#fdf6f4",
          100: "#faebe7",
          200: "#f6d6cf",
          300: "#eeb6aa",
          400: "#e08b79",
          500: "#cc634e",
          600: "#b54a36",
          700: "#973c2a",
          800: "#7d3425",
          900: "#672e21",
          950: "#38140e",
        },
        ink: {
          50: "#faf8f5",
          100: "#f1ede6",
          200: "#e2dcd1",
          300: "#cbbead",
          400: "#9a8b78",
          500: "#756755",
          600: "#594d3f",
          700: "#43392d",
          800: "#2a231b",
          900: "#16120e",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(22, 18, 14, 0.04), 0 8px 24px -4px rgba(22, 18, 14, 0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(22, 18, 14, 0.05), 0 16px 32px -6px rgba(22, 18, 14, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(-10px) scale(.98)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in .25s ease-out",
        "slide-in-right": "slide-in-right .3s cubic-bezier(.2,.7,.2,1)",
        "slide-up": "slide-up .3s ease-out",
        "toast-in": "toast-in .25s ease-out",
      },
    },
  },
  plugins: [],
};
