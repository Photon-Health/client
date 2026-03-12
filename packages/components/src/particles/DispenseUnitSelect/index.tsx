import { For, JSX, onMount } from 'solid-js';
import Select from '../Select';
import { usePhoton } from '../../context';

export interface DispenseUnitSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  /** Dose forms from the selected treatment. When provided, only these options are shown. */
  options?: string[];
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
}

export default function DispenseUnitSelect(props: DispenseUnitSelectProps) {
  const client = usePhoton();

  onMount(() => {
    if (!props.options?.length && client && client.clinical.dispenseUnits.state.dispenseUnits.length === 0) {
      client.clinical.dispenseUnits.getDispenseUnits();
    }
  });

  const isLoading = () => !props.options?.length && client?.clinical.dispenseUnits.state.isLoading;

  const units = () => {
    if (props.options && props.options.length > 0) {
      return props.options;
    }
    return client?.clinical.dispenseUnits.state.dispenseUnits.map((u) => u.name) ?? [];
  };

  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled || isLoading() || (props.options?.length === 1)}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <option value="" disabled>
        {isLoading() ? 'Loading...' : 'Select a dispense unit'}
      </option>
      <For each={units()}>
        {(unit) => (
          <option value={unit} selected={props.value === unit}>
            {unit}
          </option>
        )}
      </For>
    </Select>
  );
}
