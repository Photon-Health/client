/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';

// Get git commit hash
const getCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

export default defineConfig(({ mode }) => {
  // Load env file for the mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Create process.env object for REACT_APP_ variables
  const processEnvDefines = Object.keys(env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    }, {} as Record<string, string>);
  
  return {
    plugins: [react()],
    
    // Build configuration
    build: {
      outDir: '../../dist/apps/patient',
      sourcemap: true,
      emptyOutDir: true,
    },

    // Development server
    server: {
      port: 3000,
      open: false,
    },

    // Path resolution for monorepo workspace
    resolve: {
      alias: {
        '@packages': path.resolve(__dirname, '../../packages'),
      },
    },

    // Environment variables and defines
    define: {
      __COMMIT_HASH__: JSON.stringify(getCommitHash()),
      // Define process.env variables for compatibility
      ...processEnvDefines,
    },

    // Convert REACT_APP_ env vars to VITE_ for compatibility
    envPrefix: ['VITE_', 'REACT_APP_'],

    // Testing configuration
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['../../node_modules/@testing-library/jest-dom/extend-expect.js'],
    },

    // Ensure proper handling of workspace dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', '@chakra-ui/react'],
    },
  };
});