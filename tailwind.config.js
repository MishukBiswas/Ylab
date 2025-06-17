/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        ucr: {
          blue: '#003DA5',
          gold: '#FFB81C',
          green: '#78BE20',
          lightblue: '#009CDE',
          orange: '#FF671F',
          lightyellow: '#FBDB65',
          red: '#E4002B',
          black: '#000000',
          black80: '#4C4C4C',
          black60: '#666666',
          black40: '#999999',
          black20: '#CCCCCC',
          black10: '#E5E5E5',
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideIn: 'slideIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
