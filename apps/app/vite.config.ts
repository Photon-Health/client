/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import sourcemaps from 'rollup-plugin-sourcemaps2';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse HEAD').toString().trim();

export default defineConfig({
  // Rollup chains sourcemaps only for modules a plugin transforms (Vite's TS/JSX
  // pipeline does this for source files). Pre-built deps like @photonhealth/elements'
  // dist/index.mjs are read verbatim — their //# sourceMappingURL= comment is
  // ignored and their sidecar .map is never loaded, so stack traces through them
  // stay minified in Datadog. This plugin reads those comments and feeds the
  // sidecar maps into the chain. Remove sourcemaps() once https://github.com/vitejs/vite/issues/11743
  // ships native support.
  plugins: [react(), tsconfigPaths(), sourcemaps()],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash)
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../../dist/apps/app',
    sourcemap: true,
    emptyOutDir: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.git', '.cache', 'e2e']
  }
});
