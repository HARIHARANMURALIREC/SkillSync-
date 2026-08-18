/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0C0E',
          50: '#F4F1EA',
          100: '#E8E4DA',
          200: '#C4BDB0',
          300: '#9A9588',
          400: '#6E6A62',
          500: '#3A3D44',
          600: '#22252B',
          700: '#1A1C21',
          800: '#14161A',
          900: '#0B0C0E',
        },
        gold: {
          DEFAULT: '#C8A96A',
          hover: '#D4BC84',
          muted: '#8A7344',
          faint: 'rgba(200, 169, 106, 0.12)',
        },
        cream: '#F4F1EA',
        muted: '#9A9588',
        surface: '#14161A',
        primary: {
          50: '#F4F1EA',
          100: '#E8E4DA',
          200: '#C4BDB0',
          300: '#C8A96A',
          400: '#C8A96A',
          500: '#C8A96A',
          600: '#B89654',
          700: '#8A7344',
          800: '#C8A96A',
          900: '#D4BC84',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
