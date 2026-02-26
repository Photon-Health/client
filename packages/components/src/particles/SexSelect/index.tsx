import { For, JSX } from 'solid-js';
import Select from '../Select';

export const SEX_OPTIONS = [
  { value: 'MALE', name: 'Male' },
  { value: 'FEMALE', name: 'Female' },
  { value: 'UNKNOWN', name: 'Unknown' }
];

export interface SexSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
}

export default function SexSelect(props: SexSelectProps) {
  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <option value="" disabled>
        Select sex
      </option>
      <For each={SEX_OPTIONS}>
        {(opt) => (
          <option value={opt.value} selected={props.value === opt.value}>
            {opt.name}
          </option>
        )}
      </For>
    </Select>
  );
}
