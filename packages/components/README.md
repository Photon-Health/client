# Components

## Local Development

### particles

Run Storybook to see the `particles` at `localhost:6006`:

```shell
npm run storybook

# or via nx
npx nx run components:storybook
```

### systems

Run the local app to see the `systems` in action at `localhost:3000`:

```shell
npm run start

# or via nx
npx nx run components:start
```

Modify [dev/App.tsx](dev/App.tsx) to change the `systems`

### tests

```shell
npx nx run components:test
```
