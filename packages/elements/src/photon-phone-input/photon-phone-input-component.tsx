import { customElement } from 'solid-element';
import { parsePhoneNumber, AsYouType } from 'libphonenumber-js';

//Shoelace
import '@shoelace-style/shoelace/dist/components/input/input';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import { createMemo, onMount } from 'solid-js';

export interface PhoneInputProps {
  label?: string;
  required: boolean;
  value?: string;
  invalid: boolean;
  helpText?: string;
  disabled: boolean;
}

const Component = (props: PhoneInputProps) => {
  let ref: any;

  const dispatchPhoneChanged = (phone: string) => {
    const event = new CustomEvent('photon-phone-changed', {
      composed: true,
      bubbles: true,
      detail: {
        phone: phone
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(() => {
    if (props.value) {
      dispatchPhoneChanged(parsePhoneNumber(props.value, 'US').format('E.164'));
    }
  });

  const phoneValue = createMemo(() => {
    if (props.value) {
      if (props.value.length > 2) {
        // throws a TOO_SHORT error if the number is under two digits, but three digits totally cool _eyeroll_
        return new AsYouType('US').input(parsePhoneNumber(props.value, 'US').formatNational());
      }
      return props.value;
    }
    return '';
  });

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div class="md:py-2 flex flex-col font-sans" ref={ref}>
        <sl-input
          classList={{
            invalid: props.invalid
          }}
          disabled={props.disabled}
          class="input"
          label={props.label}
          required={props.required}
          on:sl-input={(e: any) => {
            try {
              const parsed = parsePhoneNumber(e.target.value, 'US').format('E.164');
              dispatchPhoneChanged(parsed);
            } catch {
              dispatchPhoneChanged(e.target?.value || '');
            }
          }}
          type="tel"
          invalid={props.invalid}
          placeholder={'(   ) ___-____'}
          value={phoneValue()}
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
  'photon-phone-input',
  {
    label: undefined,
    required: false,
    value: undefined,
    invalid: false,
    helpText: undefined,
    disabled: false
  },
  Component
);
