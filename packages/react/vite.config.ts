import react from '@vitejs/plugin-react';
import path from 'node:path';
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
    lib: {
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
