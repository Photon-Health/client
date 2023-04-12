const { createThemes } = require('tw-colors');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    createThemes({
      photon: {
        primaryText: colors.gray[50],
        primary500: colors.indigo[500],
        primary600: colors.indigo[600],
        secondaryText: colors.gray[900],
        secondary50: colors.indigo[50],
        secondary100: colors.indigo[100]
      },
      weekend: {
        primaryText: colors.gray[50],
        primary500: colors.sky[500],
        primary600: colors.sky[600],
        secondaryText: colors.gray[900],
        secondary50: colors.sky[50],
        secondary100: colors.sky[100]
      }
    })
  ]
};
