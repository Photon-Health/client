module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-custom-media': {
      importFrom: ['../../node_modules/open-props/media.min.css']
    },
    '@csstools/postcss-sass': {},
    'postcss-jit-props': {
      files: ['../../node_modules/open-props/src/extra/normalize.css'],
      custom_selector: ':host'
    },
    'css-has-pseudo': {},
    autoprefixer: {}
  }
};
