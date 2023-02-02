import { render } from 'solid-js/web';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => {
    const root = document.getElementById('root');
    const solidRoot = document.createElement('div');

    solidRoot.setAttribute('id', 'solid-root');
    root.appendChild(solidRoot);

    render(Story, solidRoot);

    return solidRoot;
  },
];
