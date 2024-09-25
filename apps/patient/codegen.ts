import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: `${process.env.GQL_SCHEMA_URL ?? 'http://patient-api.boson.health'}/graphql`,
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
