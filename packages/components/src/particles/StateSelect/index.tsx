import { For, JSX } from 'solid-js';
import Select from '../Select';
import { states } from '../../systems/PatientAddressForm/states';

export interface StateSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
}

export default function StateSelect(props: StateSelectProps) {
  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <option value="" disabled>
        Select state
      </option>
      <For each={states}>
        {(state) => (
          <option value={state.id} selected={props.value === state.id}>
            {state.name}
          </option>
        )}
      </For>
    </Select>
  );
}
