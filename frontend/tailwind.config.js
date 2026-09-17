/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        slate: {
          925: "#0B1220",
        },
        accent: {
          DEFAULT: "#2A6F63", // deep teal — the one bold accent color for the whole app
          light: "#3E8F80",
          dark: "#1E5349",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
