/// <reference types="node" />
import { CodegenConfig } from '@graphql-codegen/cli';

const schemaByEnv: Record<string, string> = {
  boson: 'https://clinical-api.boson.health/graphql',
  neutron: 'https://clinical-api.neutron.health/graphql',
  photon: 'https://clinical-api.photon.health/graphql',
  tau: 'http://clinical-api.tau.health:8080/graphql'
};

const env = process.env.VITE_ENV_NAME ?? 'photon';

const config: CodegenConfig = {
  schema: schemaByEnv[env],
  documents: [
    'src/**/Settings/**/*.tsx',
    // should move all future queries/mutations to these two folders, for reusability and codegen
    'src/queries/clinical-api/*.ts',
    'src/mutations/clinical-api/*.ts',
    'src/views/routes/PrescriptionForm.tsx',
    'src/views/routes/UpdatePatientForm.tsx',
    'src/views/routes/NewPatient/PatientForm.tsx',
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
