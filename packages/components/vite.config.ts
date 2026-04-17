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
    sourcemap: true,
    rollupOptions: {
      external: ['solid-js']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/setupTests.ts'],
    // Silence errors that fire on every test
    // related to jsdom not supporting valid CSS features.
    // These errors do not affect vitest functionality.
    // https://github.com/primefaces/primevue/issues/4512#issuecomment-1749633215
    onConsoleLog(log) {
      if (log.includes('Could not parse CSS stylesheet')) return false;
    }
  }
});
