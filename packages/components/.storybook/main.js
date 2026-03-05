import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  async viteFinal(config, { configType: _configType }) {
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
  addons: [],
  framework: '@storybook/html-vite',
  docs: {
    autodocs: 'tag'
  }
};