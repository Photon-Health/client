/// <reference types="vitest" />
import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps2';

// eslint-disable-next-line
const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
  plugins: [
    solidPlugin(),
    typescript({
      target: 'esnext',
      rootDir: resolvePath('./src'),
      declaration: true,
      declarationDir: resolvePath('./dist'),
      exclude: resolvePath('./node_modules/**')
    }),
    // Rollup chains sourcemaps only for modules a plugin transforms. The
    // pre-built @photonhealth/components dist/index.js we import is read
    // verbatim — its //# sourceMappingURL= comment is ignored and its sidecar
    // .map never loaded, so components code ends up in our bundle with no
    // original-source mapping. This plugin reads those comments and feeds the
    // sidecar maps into the chain, so consumers of this package (the clinical
    // app) can symbolicate stack traces all the way back to components' TS.
    // Remove sourcemaps() once https://github.com/vitejs/vite/issues/11743 ships native support.
    sourcemaps()
  ],
  build: {
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'photon-webcomponents',
      formats: ['es', 'cjs'],
      fileName: '[name]'
    },
    rollupOptions: {
      output: {
        dir: './dist',
        preserveModules: false,
        inlineDynamicImports: true
      },
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        })
      ]
    },
    target: 'esnext',
    minify: false,
    sourcemap: true
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
