const { mergeConfig } = require('vite');

module.exports = {
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      define: { 'process.env': {} }
    });
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/html-vite',
  docs: {
    autodocs: 'tag'
  }
};
