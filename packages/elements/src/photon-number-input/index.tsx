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

customElement(
  'photon-number-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    formName: undefined,
    min: undefined,
    max: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false
  },
  (props: {
    label?: string;
    required: boolean;
    value?: number;
    formName?: string;
    min?: number;
    max?: number;
    invalid: boolean;
    helpText?: string;
    disabled: boolean;
  }) => {
    let ref: any;

    const dispatchInputChanged = (input: number | undefined) => {
      const event = new CustomEvent('photon-input-changed', {
        composed: true,
        bubbles: true,
        detail: {
          input: input
        }
      });
      ref?.dispatchEvent(event);
    };

    onMount(() => {
      dispatchInputChanged(props.value);
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
            </div>
          ) : null}
          <sl-input
            classList={{
              invalid: props.invalid
            }}
            disabled={props.disabled}
            class="input"
            on:sl-input={(e: any) => {
              dispatchInputChanged(e.target.value);
            }}
            on:wheel={(e: WheelEvent) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
            min={props.min}
            max={props.max}
            type="number"
            invalid={props.invalid}
            value={props.value}
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
