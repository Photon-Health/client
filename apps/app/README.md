# Photon Clinical App

## Local Development

### Run against Boson services

> Runs against remote Boson environment services

`npx nx run app:start`


### Run against local "Tau" services

> Must be running [tau services](https://github.com/Photon-Health/services) locally

`npx nx run app:start:tau`

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
