# Photon Clinical App

## Local Development

In local development, it is possible to run the client against your local "tau" environment, or the remote "boson" dev environment. npm commands and Nx targets without an environment name attached run against boson by default, since we currently cannot spin up the entire backend architecture in tau.

### Default setup

First, download environment variables used at runtime to `.env` from AWS:

```
npx nx run app:pullenv
```

Start the clinical app dev server with hot refresh and codegen to generate TS types for any new queries/mutations. Files in `app` dependencies will automatically rebuild, but you'll need to manually refresh the webpage to see your changes.

```
npm run app

npm run app:tau
```

### Update GraphQL schema types

The codegen watch command doesn't automatically detect updates in the backend services schema. You'll need to run codegen one-off to update types in the `client` repo.

If running locally, ensure [tau services](https://github.com/Photon-Health/services) is running first.

```
npx nx run app:codegen

npx nx run app:codegen:tau
```

### Start

Start the app

If running locally, ensure [tau services](https://github.com/Photon-Health/services) is running first.

```
npx nx run app:start

npx nx run app:start:tau
```

### Playwright e2e Tests

End-to-end tests run against the browser, testing the app "end" to the server "end".
These are expensive to run, and are best suited to validating critical user flows within the application.

#### First time setup:

1. Copy `apps/app/.env.local.sample` into a new file named `apps/app/.env.local`
2. Go to 1password and search for "e2e test user" (in Shared credentials)
3. Copy password into the `PLAYWRIGHT_E2E_ACCOUNT_PASSWORD` field inside `.env.local`

#### Run e2e tests:

```shell
# run with headless browser
$ npx nx run app:e2e

# or run within UI popup window
$ npx nx run app:e2e:ui
```

### Tests

`npx nx run app:test`

Update test snapshots:

`npx nx run app:test -- -u`

Generate test coverage report:

`npx nx run app:test -- --coverage`

### Linting

Run ESLint manually:

`npx nx run app:lint`

Automatically fix ESLint issues:

`npx nx run app:lint:fix`

### Build

`npx nx run app:build:boson`

Builds the app for each environment into the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Deployment

Refer to [our Notion docs](https://www.notion.so/photons/Deployments-a5e7334066744b13a9cd6dc49edb3a6d) on how to deploy to different environments.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
