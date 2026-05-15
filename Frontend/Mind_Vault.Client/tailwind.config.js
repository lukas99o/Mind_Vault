/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        vault: {
          sand: '#f6efe5',
          paper: '#fffaf2',
          ink: '#1e2933',
          teal: '#1f7a72',
          gold: '#c58a3d',
          coral: '#dd6b4d'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif']
      },
      boxShadow: {
        card: '0 24px 60px rgba(30, 41, 51, 0.12)'
      }
    }
  },
  plugins: []
};
