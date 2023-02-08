# Client Monorepo

<a alt="photon logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://uploads-ssl.webflow.com/636c1da7b9e42c43e229900c/636c1da7b9e42caa79299017_header-logo.svg" width="100"></a>

## Getting started

In the root of this folder, look for your target in `apps/` or `packages/` and run in this format:

```
npx nx run [project][:target][:configuration] [_..]
```

For example, run a target for a app:

```
npx nx run app:start
```

or

```
npx nx run elements:upload-s3:dist
```

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
