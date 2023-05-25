import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

const resolvePath = (str: string) => path.resolve(__dirname, str);

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig({
  plugins: [
    solidPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: resolvePath('node_modules/@shoelace-style/shoelace/dist/assets'),
          dest: resolvePath('dist/shoelace')
        }
      ]
    }),
    typescript({
      target: 'esnext',
      rootDir: resolvePath('./src'),
      declaration: true,
      declarationDir: resolvePath('./dist'),
      exclude: resolvePath('./node_modules/**')
    })
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
    minify: true
  }
});
