import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/input/input';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import { onMount } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';

const Component = (props: {
  label?: string;
  required: boolean;
  value?: string;
  formName?: string;
  invalid: boolean;
  helpText?: string;
  optional?: boolean;
  disabled: boolean;
  debounceTime?: number;
  dispatchOnMount?: boolean;
}) => {
  let ref: any;

  const dispatchInputChanged = (input: string) => {
    const event = new CustomEvent('photon-input-changed', {
      composed: true,
      bubbles: true,
      detail: {
        input: input
      }
    });
    ref?.dispatchEvent(event);
  };

  const debouncedDispatchInputChanged = debounce(
    (input: string) => dispatchInputChanged(input),
    props.debounceTime
  );

  onMount(() => {
    if (props.dispatchOnMount) {
      dispatchInputChanged(props.value ?? '');
    }
  });

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div class="flex flex-col font-sans" ref={ref}>
        <sl-input
          classList={{
            invalid: props.invalid
          }}
          disabled={props.disabled}
          class="input"
          on:sl-input={(e: any) => {
            debouncedDispatchInputChanged(e.target.value);
          }}
          type="text"
          invalid={props.invalid}
          value={props.value || ''}
          label={props.label}
          required={props.required}
        >
          <p slot="help-text" class="text-red-400 pt-1 h-[21px] font-sans">
            {props.helpText}
          </p>
        </sl-input>
      </div>
    </>
  );
};
customElement(
  'photon-text-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    formName: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false,
    debounceTime: 250,
    dispatchOnMount: false,
    optional: false
  },
  Component
);
