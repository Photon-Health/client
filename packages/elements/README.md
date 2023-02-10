# Photon Web Components

Photon's collection of customizable and reusable components to help clients integrate seamlessly with our system.

## Creating a WebComponent in SolidJS

We utilize SolidJS ability (solid-element) to author a normal SolidJS component and transpile it to the WebComponent API (ref: [https://developer.mozilla.org/en-US/docs/Web/Web_Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)).

A SolidJS WebComponent, at it’s most basic, looks like the following contained in an index.tsx:

```tsx
//Shoelace
import { customElement } from 'solid-element';

//Styles
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline'; //Inline is required to encapsulate the styles below

customElement(
  'photon-my-first-component', // WebComponent Tag Name
  {
    disabled: false,
    loading: false,
    full: false
  }, // Default Props
  (props: { disabled: boolean; loading: boolean; full: boolean }, options) => {
    return (
      <>
        <style>{tailwind}</style>
        <style>{styles}</style>
        <div>
          <p class="text-blue-500">My first component</p>
        </div>
      </>
    );
  }
);
```

The API centers around calling the `customElement` function:

- First Parameter is the WebComponent Tag Name. This is the name under which your component will be registered and usable from HTML. In this example, `photon-my-first-component`
- Second Parameter is the default values of properties. If you have properties a user isn’t supposed to specify, you can declare the defaults here. Any properties that are not kebab case (e.g first-word) are transformed to kebab-case when passed from HTML/JSX (per WebComponent Spec Guidelines)
- Third Parameter is a function of (props, options) ⇒ JSX.Element. NOTE: Do not de-structure `props` as in SolidJS this will make your properties (which are a Proxy object) lose reactivity. The second parameter, `options` contains a singular property `element` which gives you raw access to your DOM element created by this web-component. This is considered advanced functionality and rarely used (though I use it in our codebase and have examples of when it’s appropriate).
