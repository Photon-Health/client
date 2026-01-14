# Photon Patient App

## Local Development

### Default setup

Starts the clinical app dev server with hot refresh and codegen to generate types for any new queries/mutations. Files in `app` dependencies will automatically rebuild, but you'll need to manually refresh the webpage to see your changes.

`npm run app`

### Run against Boson services

Run against remote Boson environment services

`npx nx run patient:start`

### Run against local "Tau" services

Must be running [tau services](https://github.com/Photon-Health/services) locally

`npx nx run patient:start:tau`

### Update GraphQL schema types

The codegen watch command doesn't automatically detect updates in the backend `services` schema. You'll need to run codegen to generate new types for any changes.

`npx nx run patient:codegen:tau`
