/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        artek: {
          green: "#00A651",
          blue: "#0066B3",
          orange: "#F7941D",
        },
      },
    },
  },
  plugins: [],
};
