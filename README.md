# Client Monorepo

<a alt="photon logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://uploads-ssl.webflow.com/636c1da7b9e42c43e229900c/636c1da7b9e42caa79299017_header-logo.svg" width="100"></a>

## Getting started

Install it all

```
npm i
```

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

## Building the Chrome Extension Locally

In order to run the local server with support for live-reloading and HMR, run:

```
npx nx run extension:dev
```

Then, navigate to chrome://extensions (ensure you have "Developer mode" enabled) and load the unpacked extension from the `dist/apps/extension/build/chrome-mv3-dev` folder.

After the extension is loaded, click the puzzle piece icon in the Chrome toolbar and select "Photon Health" from the list of pre-authorized extensions. Now you can use the extension with the popup visible.

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
