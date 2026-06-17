/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color, #FF6B35)',
        secondary: '#0F1419',
        accent: '#4DD0E1',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        opensans: ['var(--font-opensans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
