/* eslint-disable */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,jsx,js,tsx,ts}'],
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens
    },
    extend: {
      colors: {
        'photon-blue': '#3182ce',
        'photon-blue-dark': '#2b6cb0',
        'photon-light': '#F7F4F4'
      },
      boxShadow: {
        card: '0px 0px 1px rgba(48, 49, 51, 0.05),0px 2px 4px rgba(48, 49, 51, 0.1);'
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        2000: '2000'
      }
    }
  }
};
