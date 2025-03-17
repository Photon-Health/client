const { mergeConfig } = require('vite');
const path = require('path');

module.exports = {
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      define: { 'process.env': {} },
      resolve: {
        alias: {
          '@photonhealth/sdk': path.resolve(__dirname, '../../../packages/sdk')
        }
      }
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
