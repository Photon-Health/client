import path from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

// eslint-disable-next-line
const resolvePath = (str: string) => path.resolve(__dirname, str);

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig({
  plugins: [
    // @ts-ignore TODO vite should have first class typescript support ...
    typescript({
      target: 'es6',
      rootDir: resolvePath('./src'),
      declaration: true,
      declarationDir: resolvePath('./dist'),
      exclude: resolvePath('./node_modules/**')
    })
  ],
  build: {
    lib: {
      entry: resolvePath('src/lib.ts'),
      name: 'photon-sdk-js',
      formats: ['es', 'cjs'],
      fileName: '[name]'
    },
    rollupOptions: {
      external: isExternal,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        dir: './dist',
        inlineDynamicImports: false
      }
    },
    target: 'es6',
    minify: false
  }
});
