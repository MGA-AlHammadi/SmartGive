/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: '#1a4731', // Dunkelgrün aus dem Design
          light: '#2a6a4a',
        },
        'bg-primary': '#F5F5ED', // Off-White/Beige aus dem Design
      }
    },
  },
  plugins: [],
}

