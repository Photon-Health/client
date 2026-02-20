import { createEffect, createSignal, JSX } from 'solid-js';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js';
import Input from '../Input';

function toNational(value: string): string {
  try {
    if (value.length > 2) {
      return new AsYouType('US').input(parsePhoneNumber(value, 'US').formatNational());
    }
  } catch {
    // fall through
  }
  return value;
}

function toE164(value: string): string {
  try {
    return parsePhoneNumber(value, 'US').format('E.164');
  } catch {
    return value;
  }
}

export interface PhoneInputProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onPhoneChange?: (value: string) => void;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

export default function PhoneInput(props: PhoneInputProps) {
  const [display, setDisplay] = createSignal(props.value ? toNational(props.value) : '');

  // Sync display when value prop changes externally (e.g. patient data loads)
  createEffect(() => {
    if (props.value) {
      setDisplay(toNational(props.value));
    }
  });

  return (
    <Input
      type="tel"
      placeholder="(   ) ___-____"
      value={display()}
      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
        setDisplay(e.currentTarget.value);
        props.onPhoneChange?.(toE164(e.currentTarget.value));
      }}
      onBlur={props.onBlur}
      required={props.required}
      disabled={props.disabled}
    />
  );
}
