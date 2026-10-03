/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        warm: {
          50: "#faf9f6",
          100: "#f6f5f1",
          200: "#edece5",
          300: "#dedcd2",
          400: "#b8b5a6",
          500: "#8c8877",
          600: "#696657",
          700: "#4f4c40",
          800: "#36342c",
          900: "#1f1d18",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 10px 28px -6px rgba(15, 23, 42, 0.08)",
        "card-hover": "0 12px 36px -8px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
        panel: "0 24px 64px -16px rgba(15, 23, 42, 0.28)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

