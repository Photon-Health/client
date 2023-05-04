import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'components',
      fileName: 'index'
    },
    target: 'esnext',
    rollupOptions: {
      external: ['solid-js']
    }
  }
});
