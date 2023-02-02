import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/textarea/textarea';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import { onMount } from 'solid-js';

customElement(
  'photon-textarea',
  {
    label: undefined,
    required: false,
    placeholder: undefined,
    value: undefined,
    formName: undefined,
    helpText: undefined,
    invalid: false,
    disabled: false,
  },
  (props: {
    label?: string;
    required: boolean;
    placeholder?: string;
    value?: string;
    formName?: string;
    helpText?: string;
    invalid: boolean;
    disabled: boolean;
  }) => {
    let ref: any;

    const dispatchInputChanged = (value: string) => {
      const event = new CustomEvent('photon-textarea-changed', {
        composed: true,
        bubbles: true,
        detail: {
          value: value,
        },
      });
      ref?.dispatchEvent(event);
    };

    onMount(() => {
      dispatchInputChanged(props.value ?? '');
    });

    return (
      <>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <style>{styles}</style>
        <div class="py-2 flex flex-col" ref={ref}>
          {props.label ? (
            <div class="flex items-center pb-2 font-sans">
              <p class="text-gray-700 text-sm">{props.label}</p>
              {props.required ? <p class="pl-1 text-red-500">*</p> : null}
              {!props.required ? <p class="text-gray-400 text-xs pl-2">Optional</p> : null}
            </div>
          ) : null}
          <sl-textarea
            on:sl-input={(e: any) => {
              dispatchInputChanged(e.target.value);
            }}
            classList={{
              invalid: props.invalid,
            }}
            class="input"
            disabled={props.disabled}
            invalid={props.invalid}
            value={props.value ? props.value : ''}
            placeholder={props.placeholder}
          >
            <p slot="help-text" class="text-red-500 pt-2 h-[21px] font-sans">
              {props.helpText}
            </p>
          </sl-textarea>
        </div>
      </>
    );
  }
);
