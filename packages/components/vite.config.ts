import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path';

export default defineConfig({
  plugins: [
    // @ts-ignore
    solidPlugin()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'components',
      formats: ['es', 'umd'],
      fileName: (format) => `components.${format}.js`
    },
    target: 'esnext'
  }
});
