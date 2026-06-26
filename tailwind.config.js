/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#FAF8F5',
          100: '#F2EDE6',
          200: '#E4D8C8',
          300: '#D0BC9E',
          400: '#C8B89A',
          500: '#A89880',
          600: '#8A7A66',
          700: '#6E6052',
          800: '#524840',
          900: '#3A322D',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          50:  '#F5F5F5',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0A0A0A',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
      }
    },
  },
  plugins: [],
}
