// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./tailwind.base.cjs');

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  ...base,
  content: ['./src/**/*.{html,js,jsx,ts,tsx}']
};
