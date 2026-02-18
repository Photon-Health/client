import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.REACT_APP_GRAPHQL_API_ENDPOINT,
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
