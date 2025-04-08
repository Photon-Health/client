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
import { onMount, createSignal } from 'solid-js';
import formatDate from './formatDate';

const Component = (props: {
  label?: string;
  required: boolean;
  formName?: string;
  invalid: boolean;
  helpText?: string;
  disabled: boolean;
  value?: string;
  noInitialDate?: boolean;
}) => {
  let ref: any;
  let inputRef: any;
  // initialized with today's date
  const initialDate = props?.noInitialDate ? '' : format(new Date(), 'yyyy-MM-dd').toString();
  const [date, setDate] = createSignal(props?.value || initialDate);

  const dispatchDateSelected = (date: string) => {
    const event = new CustomEvent('photon-datepicker-selected', {
      composed: true,
      bubbles: true,
      detail: {
        date: date
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(() => {
    dispatchDateSelected(date());
    inputRef?.addEventListener('paste', (e: any) => {
      const pasteText = e.clipboardData.getData('Text');
      const formattedDate = formatDate(pasteText);

      if (formattedDate) {
        setDate(formattedDate);
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
          value={date()}
          invalid={props.invalid}
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
    noInitialDate: undefined
  },
  Component
);
