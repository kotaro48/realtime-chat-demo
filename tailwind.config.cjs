/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ec4899',
          soft: '#f9a8d4'
        }
      }
    }
  },
  plugins: []
};

