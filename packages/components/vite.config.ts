/// <reference types="vitest" />
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import * as path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true
    }),
    solidPlugin()
  ],
  build: {
    lib: {
      // eslint-disable-next-line
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'components',
      fileName: 'index'
    },
    target: 'esnext',
    rollupOptions: {
      external: ['solid-js']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/test-setup.ts']
  }
});
