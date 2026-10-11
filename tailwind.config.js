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
          50: "#fdf7f6",
          100: "#f8ebe9",
          200: "#f0d4d0",
          300: "#e4b4ad",
          400: "#d08e85",
          500: "#b86b62",
          600: "#9a524b",
          700: "#7d423d",
          800: "#683835",
          900: "#58312f",
          950: "#2f1a18",
        },
        ink: {
          50: "#faf8f6",
          100: "#f3efe9",
          200: "#e4dcd2",
          300: "#cfc3b4",
          400: "#a89886",
          500: "#827564",
          600: "#5f564b",
          700: "#433d36",
          800: "#2c2824",
          900: "#1c1917",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,.04), 0 4px 20px -6px rgba(28,25,23,.08)",
        "card-hover":
          "0 2px 4px rgba(28,25,23,.06), 0 12px 30px -8px rgba(28,25,23,.14)",
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
