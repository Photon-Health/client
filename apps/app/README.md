# Photon Clinical App

## Local Development

### Run against Boson services

> Runs against remote Boson environment services

`npx nx run app:start`

### Run against local "Tau" services

> Must be running [tau services](https://github.com/Photon-Health/services) locally

`npx nx run app:start:tau`

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

`npx nx run app:build:neutron`

`npx nx run app:build:photon`

Builds the app for each environment into the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
