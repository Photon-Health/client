# Photon Patient App

## Local Development

In local development, it is possible to run the client against your local "tau" environment, or the remote "boson" dev environment. npm commands and Nx targets without an environment name attached run against boson by default, since we currently cannot spin up the entire backend architecture in tau.

### Default setup

Start the patient app dev server with hot refresh and codegen to generate TS types for any new queries/mutations. Files in `patient` dependencies will automatically rebuild, but you'll need to manually refresh the webpage to see your changes.

```
npm run patient

npm run patient:tau
```

### Update GraphQL schema types

The codegen watch command doesn't automatically detect updates in the backend services schema. You'll need to run codegen one-off to update types in the `client` repo.

If running locally, ensure [tau services](https://github.com/Photon-Health/services) is running first.

```
npx nx run patient:codegen

npx nx run patient:codegen:tau
```

### Start

Start the app

If running locally, ensure [tau services](https://github.com/Photon-Health/services) is running first.

```
npx nx run patient:start

npx nx run patient:start:tau
```
