/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Marshall heritage palette — warm brick reds, forest greens, cream
        marshall: {
          50: '#fdf8f0',
          100: '#f9edd9',
          200: '#f2d8b0',
          300: '#e9be7d',
          400: '#dfa04d',
          500: '#d4862f',
          600: '#b86a24',
          700: '#995020',
          800: '#7d4121',
          900: '#67371e',
          950: '#3a1b0e',
        },
        forest: {
          50: '#f0f7f1',
          100: '#dceede',
          200: '#baddbf',
          300: '#8ec498',
          400: '#5ea56d',
          500: '#3d8750',
          600: '#2c6b3d',
          700: '#245633',
          800: '#1f452a',
          900: '#1a3924',
          950: '#0d2014',
        },
        brick: {
          50: '#fdf3f3',
          100: '#fce4e4',
          200: '#facece',
          300: '#f5abab',
          400: '#ec7b7b',
          500: '#df5252',
          600: '#c43838',
          700: '#a42a2a',
          800: '#882626',
          900: '#712626',
          950: '#3d0f0f',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#faf3e1',
          300: '#f5e8c8',
          400: '#edd6a3',
          500: '#e3c07a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
