import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: `${process.env.GQL_SCHEMA_URL ?? 'http://clinical-api.boson.health'}/graphql`,
  documents: [
    'src/**/Settings/**/*.tsx',
    'src/views/routes/PrescriptionForm.tsx',
    'src/views/routes/NewOrder/index.tsx',
    'src/views/routes/NewOrder/components/OrderForm.tsx',
    'src/views/components/TicketModal.tsx',
    'src/views/components/Auth.tsx',
    'src/views/components/Nav.tsx'
  ],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client'
    }
  }
};

export default config;
