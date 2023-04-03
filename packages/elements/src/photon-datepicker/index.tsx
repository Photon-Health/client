import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/input/input';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';

import { format } from 'date-fns';
import { onMount, createSignal } from 'solid-js';
import formatDate from './formatDate';

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
  (props: {
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
          {props.label ? (
            <div class="flex items-center pb-2">
              <p class="text-gray-700 text-sm font-sans">{props.label}</p>
              {props.required ? <p class="pl-1 text-red-500">*</p> : null}
            </div>
          ) : null}
          <sl-input
            ref={inputRef}
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
          ></sl-input>
          <p slot="help-text" class="text-sm text-red-500 pt-2 h-[21px] font-sans">
            {props.helpText}
          </p>
        </div>
      </>
    );
  }
);
