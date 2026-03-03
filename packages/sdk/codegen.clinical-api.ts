import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://clinical-api.boson.health/graphql',
  // Only include documents that use clinical-api
  documents: ['./src/graphql/clinical-api/*.ts'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/graphql/clinical-api/gql/': {
      preset: 'client'
    }
  }
};
export default config;
