/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayur: {
          green: {
            50: '#f2f8f4',
            100: '#e1ede4',
            200: '#c5dacb',
            300: '#9dbca7',
            400: '#6f967d',
            500: '#4e7a5e',
            600: '#3c6148',
            700: '#324f3b',
            800: '#2a4132',
            900: '#23362a',
            950: '#131e17',
          },
          gold: {
            50: '#fdfbeb',
            100: '#fbf5c4',
            200: '#f7e785',
            300: '#f3d346',
            400: '#eebb1b',
            500: '#d59f0f',
            600: '#b87c0a',
            700: '#93580c',
            800: '#7a470f',
            900: '#673c12',
            950: '#3c1e05',
          },
          slate: {
            50: '#f6f7f9',
            100: '#ebedf2',
            200: '#d3d7e2',
            300: '#adb6c9',
            400: '#7f8ea9',
            500: '#5c6d8d',
            600: '#475674',
            700: '#3a455f',
            800: '#323a4f',
            900: '#2c3244',
            950: '#1a1d28',
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
