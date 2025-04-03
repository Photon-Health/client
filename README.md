# Client Monorepo

<a alt="photon logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://uploads-ssl.webflow.com/636c1da7b9e42c43e229900c/636c1da7b9e42caa79299017_header-logo.svg" width="100"></a>

## Local Development

### Get started

Install it all

```
npm i
```

In the root of this folder, look for your target in `apps/` or `packages/` and run in this format:

```
npx nx run [project][:target][:configuration] [_..]
```

For example, run an `app` target:

```
npx nx run app:start
```

or, run an `elements` target:

```
npx nx run elements:lint:only-errors
```

### Run clinical app

See [clinical app README](apps/app/README.md)

### Run patient app

See [patient app README](apps/patient/README.md)

### Run components storybook

See [components README](packages/components/README.md)

### Run embeddable components

See [elements README](packages/elements/README.md)

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
