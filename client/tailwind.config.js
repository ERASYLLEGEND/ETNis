/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nis: {
          navy: {
            50: '#F0F5FA',
            100: '#E1EBF5',
            200: '#C3D7EB',
            300: '#95BCE0',
            400: '#609CD2',
            500: '#3A7EC3',
            600: '#2A63A5',
            700: '#224F85',
            800: '#1E3A5F', // Primary NIS Navy
            900: '#162C48',
            950: '#0E1C30',
          },
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
