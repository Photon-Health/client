/// <reference types="vitest" />
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    solidPlugin(),
    // TODO: this is not working, it's not generating the types as expected,
    // generates a file that points to a file that doesn't exist
    dts({
      insertTypesEntry: true
    })
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
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    // vitest can't seem to find jest-dom, it looks
    // locally but not at the root node_modules
    setupFiles: ['../../node_modules/@testing-library/jest-dom/extend-expect.js'],
    // solid needs to be inline to work around
    // a resolution issue in vitest:
    deps: {
      inline: [/solid-js/]
    },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false
  }
});
