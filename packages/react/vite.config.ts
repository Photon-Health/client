import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      exclude: ['examples']
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['examples']
    })
  ],
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      // eslint-disable-next-line
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'react',
      formats: ['es', 'cjs'],
      fileName: (format) => `react.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
