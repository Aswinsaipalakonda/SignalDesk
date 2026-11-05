/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F6F1",
        line: "#E3E7DF",
        ink: {
          DEFAULT: "#003437",
          soft: "#355655",
          muted: "#6B7F7B",
        },
        brand: {
          50: "#EEF9F4",
          100: "#D9F2E7",
          200: "#B6E5D2",
          300: "#7BD5A5",
          400: "#37B48C",
          500: "#019077",
          600: "#0A7A63",
          700: "#0E5E44",
          800: "#0C4B38",
          900: "#003437",
        },
        mint: {
          50: "#F0FAF5",
          100: "#DDF3E7",
          200: "#B9E8CF",
          300: "#7BD5A5",
          400: "#55C58F",
          500: "#2FAE76",
          600: "#239266",
          700: "#1B7553",
        },
        sky: {
          50: "#EFF8F7",
          100: "#D8EFED",
          200: "#B9E3E1",
          400: "#4FA3A1",
          500: "#368C89",
          600: "#2E7D7A",
        },
        amber: {
          50: "#FFF8EA",
          100: "#FDECC8",
          200: "#FBDDA0",
          300: "#FDD08A",
          400: "#FDBB4D",
          500: "#FDA827",
          600: "#C97E12",
          700: "#9A5F0E",
        },
        rose: {
          50: "#FDF3F1",
          100: "#FAE4DF",
          300: "#E99A8D",
          400: "#DF7565",
          500: "#D45B4A",
          600: "#B84534",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,52,55,0.03), 0 14px 34px -22px rgba(0,52,55,0.18)",
        float: "0 24px 60px -24px rgba(0,52,55,0.25)",
        brand: "0 12px 28px -12px rgba(1,144,119,0.38)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #019077 0%, #0E5E44 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
