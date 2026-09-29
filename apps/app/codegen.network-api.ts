/// <reference types="node" />
import { CodegenConfig } from '@graphql-codegen/cli';

// network-api is only deployed to boson/tau for now, so this codegen runs separately from the
// main `codegen` target (which every env's build depends on) and its output is committed.
const schemaByEnv: Record<string, string> = {
  boson: 'http://network-api.boson.health/graphql',
  tau: 'http://network-api.tau.health/graphql'
};

const env = process.env.VITE_ENV_NAME ?? 'boson';

const config: CodegenConfig = {
  schema: schemaByEnv[env],
  documents: ['src/network-api/documents.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/network-api/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false
      }
    }
  }
};

export default config;
