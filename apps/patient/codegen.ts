import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://patient-api.boson.health/graphql',
  documents: ['**/*.ts'],
  config: {
    maybeValue: 'T | undefined'
  },
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request']
    }
  }
};
export default config;
