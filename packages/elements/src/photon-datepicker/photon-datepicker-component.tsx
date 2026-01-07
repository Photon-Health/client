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

import { format } from 'date-fns';
import { onMount } from 'solid-js';
import formatDate from './formatDate';
import { CALENDAR_DATE_FORMAT } from '@photonhealth/components';

const Component = (props: {
  label?: string;
  required: boolean;
  formName?: string;
  invalid: boolean;
  helpText?: string;
  disabled: boolean;
  value?: string;
  min?: Date;
}) => {
  let ref: any;
  let inputRef: any;
  const dispatchDateSelected = (date: string) => {
    const event = new CustomEvent('photon-datepicker-selected', {
      composed: true,
      bubbles: true,
      detail: {
        // Handle edge case where clicking Clear
        // sets value to an empty string instead of `undefined`
        // which interferes with validation
        date: date || undefined
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(() => {
    inputRef?.addEventListener('paste', (e: any) => {
      const pasteText = e.clipboardData.getData('Text');
      const formattedDate = formatDate(pasteText);

      if (formattedDate) {
        dispatchDateSelected(formattedDate);
      }
    });
  });

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div class="md:py-2  flex flex-col" ref={ref}>
        <sl-input
          ref={inputRef}
          label={props.label}
          required={props.required}
          on:sl-input={(e: any) => {
            dispatchDateSelected(e.target.value);
          }}
          disabled={props.disabled}
          classList={{
            invalid: props.invalid
          }}
          class="input"
          type="date"
          value={props.value}
          invalid={props.invalid}
          min={props.min ? format(props.min, CALENDAR_DATE_FORMAT).toString() : undefined}
        >
          <p slot="help-text" class="text-sm text-red-400 pt-1 h-[21px] font-sans">
            {props.helpText}
          </p>
        </sl-input>
      </div>
    </>
  );
};
customElement(
  'photon-datepicker',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    disabled: false,
    value: undefined,
    min: undefined
  },
  Component
);
