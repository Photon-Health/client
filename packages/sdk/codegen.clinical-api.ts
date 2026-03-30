import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaByEnv: Record<string, string> = {
  boson: 'https://clinical-api.boson.health/graphql',
  neutron: 'https://clinical-api.neutron.health/graphql',
  photon: 'https://clinical-api.photon.health/graphql',
  tau: 'http://clinical-api.tau.health:8080/graphql'
};

const env = process.env.VITE_ENV_NAME ?? 'photon';

const config: CodegenConfig = {
  schema: schemaByEnv[env],
  // Only include documents that use clinical-api
  documents: ['./src/graphql/clinical-api/*.ts'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/graphql/clinical-api/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false
      }
    }
  }
};
export default config;
