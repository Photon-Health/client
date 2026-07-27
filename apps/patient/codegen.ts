/// <reference types="node" />
import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaByEnv: Record<string, string> = {
  boson: 'https://patient-api.boson.health/graphql',
  neutron: 'https://patient-api.neutron.health/graphql',
  photon: 'https://patient-api.photon.health/graphql',
  tau: 'http://patient-api.tau.health/graphql'
};

const env = process.env.VITE_ENV_NAME ?? 'photon';

const config: CodegenConfig = {
  schema: schemaByEnv[env],
  documents: ['**/*.ts'],
  config: {
    maybeValue: 'T | undefined',
    enumsAsTypes: true,
    allowEnumStringTypes: true
  },
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request']
    }
  }
};
export default config;
