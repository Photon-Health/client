import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // schema: 'http://clinical-api.tau.health:8080/graphql',
  schema: 'http://clinical-api.boson.health/graphql',
  documents: [
    'apps/app/src/**/Settings/**/*.tsx',
    'apps/app/src/views/routes/PrescriptionForm.tsx',
    'apps/app/src/views/routes/NewOrder/index.tsx',
    'apps/app/src/views/routes/NewOrder/components/OrderForm.tsx',
    'apps/app/src/views/components/TicketModal.tsx',
    'apps/app/src/views/components/Auth.tsx',
    'apps/app/src/views/components/Nav.tsx'
  ],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './apps/app/src/gql/': {
      preset: 'client'
    }
  }
};

export default config;
