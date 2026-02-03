/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tallyNavy: '#7F1D1D',
        tallyBgLight: '#FFF5F5',
        tallyBgLighter: '#FEE2E2',
        tallyYellow: '#FFD700',
        tallyPanel: '#E8E8E8',
        tallyBorder: '#D0D0D0',
        tallyTableBorder: '#CCCCCC',
        tallyRed: '#CC0000',
        tallyBlueButton: '#DC2626',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['10px', '1.3'],
        sm: ['11px', '1.3'],
        base: ['12px', '1.4'],
        lg: ['14px', '1.4'],
      },
    },
  },
  plugins: [],
};

