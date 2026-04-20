// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../components/tailwind.base.cjs');

module.exports = {
  ...base,
  // components is a helper library for elements
  // so elements tailwind also needs to build styles for components
  content: ['./src/**/*.{html,jsx,js,tsx,ts}', '../components/src/**/*.{html,jsx,js,tsx,ts}']
};
