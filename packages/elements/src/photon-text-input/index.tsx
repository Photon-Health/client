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
  (props: {
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
          {props.label ? (
            <div class="flex items-center pb-2">
              <p class="text-gray-700 text-sm">{props.label}</p>
              {props.required ? <p class="pl-1 text-red-500">*</p> : null}
              {props.optional ? <p class="text-gray-400 text-xs pl-2 font-sans">Optional</p> : null}
            </div>
          ) : null}
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
          >
            <p slot="help-text" class="text-red-500 pt-1 h-[21px] font-sans">
              {props.helpText}
            </p>
          </sl-input>
        </div>
      </>
    );
  }
);
