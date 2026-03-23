/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["var(--font-prompt)", "sans-serif"],
      },
      colors: {
        ocean: {
          50: "#e0f7ff",
          100: "#b3edff",
          200: "#80deff",
          300: "#4dceff",
          400: "#26c0f7",
          500: "#00B4DB",
          600: "#0096C7",
          700: "#0077B6",
          800: "#005a8e",
          900: "#003d63",
        },
      },
      animation: {
        "slide-up": "slideUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
