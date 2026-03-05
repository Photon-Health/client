import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.VITE_CLINICAL_GRAPHQL_URI,
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
