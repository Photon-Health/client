import { For, JSX, onMount } from 'solid-js';
import Select from '../Select';
import { usePhoton } from '../../context';

export interface DispenseUnitSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
}

export default function DispenseUnitSelect(props: DispenseUnitSelectProps) {
  const client = usePhoton();

  onMount(() => {
    if (client && client.clinical.dispenseUnits.state.dispenseUnits.length === 0) {
      client.clinical.dispenseUnits.getDispenseUnits();
    }
  });

  const isLoading = () => client?.clinical.dispenseUnits.state.isLoading;

  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled || isLoading()}
      onChange={props.onChange}
    >
      <option value="" disabled>
        {isLoading() ? 'Loading...' : 'Select a dispense unit'}
      </option>
      <For each={client?.clinical.dispenseUnits.state.dispenseUnits}>
        {(unit) => (
          <option value={unit.name} selected={props.value === unit.name}>
            {unit.name}
          </option>
        )}
      </For>
    </Select>
  );
}
