import { For, JSX } from 'solid-js';
import Select from '../Select';

export const GENDER_OPTIONS = [
  { value: 'Male/Man', name: 'Male/Man' },
  { value: 'Female/Woman', name: 'Female/Woman' },
  { value: 'TransMale/TransMan', name: 'TransMale/TransMan' },
  { value: 'TransFemale/TransWoman', name: 'TransFemale/TransWoman' },
  { value: 'Genderqueer/Gender nonconforming', name: 'Genderqueer/Gender nonconforming' },
  { value: 'Something else', name: 'Something else' },
  { value: 'Decline to answer', name: 'Decline to answer' }
];

export interface GenderSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
}

export default function GenderSelect(props: GenderSelectProps) {
  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <option value="" disabled>
        Select gender
      </option>
      <For each={GENDER_OPTIONS}>
        {(opt) => (
          <option value={opt.value} selected={props.value === opt.value}>
            {opt.name}
          </option>
        )}
      </For>
    </Select>
  );
}
