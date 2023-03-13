# Components

## Storybook

Referencing this [project](https://github.com/elite174/storybook-solid-js).

To make HMR work for your component you need to render it as JSX:

```
// Correct! HMR works!
// Let's assume that this is storybook meta object
export default {
  // ...
  render: (props) => <Counter {...props} />,
  // ...
} as Meta<ComponentProps<typeof Counter>>;
```
