/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0E5E44",
          "green-hover": "#094733",
          "green-light": "#EBF5F0",
          teal: "#14B8A6",
          "teal-light": "#F0FDFA",
        },
        surface: {
          warm: "#F8FAF8",
          card: "#FFFFFF",
          subtle: "#F1F5F2",
        },
        border: {
          subtle: "#E8EFE9",
          hover: "#D1E0D3",
        },
        text: {
          main: "#1A202C",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        priority: {
          high: "#DC2626",
          "high-bg": "#FEF2F2",
          "high-border": "#FEE2E2",
          med: "#D97706",
          "med-bg": "#FFFBEB",
          "med-border": "#FEF3C7",
          low: "#16A34A",
          "low-bg": "#F0FDF4",
          "low-border": "#DCFCE7",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.03), 0 6px 16px rgba(14, 94, 68, 0.02)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 12px 24px -4px rgba(14, 94, 68, 0.06)',
      }
    },
  },
  plugins: [],
}
