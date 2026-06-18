import { For, JSX, onMount, createMemo } from 'solid-js';
import Select from '../Select';
import { usePhoton } from '../../context';

export interface DispenseUnitSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  recommendedUnits?: string[];
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
}

export default function DispenseUnitSelect(props: DispenseUnitSelectProps) {
  const client = usePhoton();

  onMount(() => {
    if (client && client.clinical.dispenseUnits.state.dispenseUnits.length === 0) {
      client.clinical.dispenseUnits.getDispenseUnits();
    }
  });

  const isLoading = () => client?.clinical.dispenseUnits.state.isLoading;

  // return recommended dispense units and fallback to full list of options
  const options = createMemo(() => {
    const all = client?.clinical.dispenseUnits.state.dispenseUnits ?? [];
    const recommended = props.recommendedUnits || [];
    if (recommended.length > 0) return all.filter((option) => recommended.includes(option.name));
    return all;
  });

  return (
    <Select
      value={props.value}
      required={props.required}
      disabled={props.disabled || isLoading()}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <option value="" disabled>
        {isLoading() ? 'Loading...' : 'Select a dispense unit'}
      </option>
      <For each={options()}>
        {(unit) => (
          <option value={unit.name} selected={props.value === unit.name}>
            {unit.name}
          </option>
        )}
      </For>
    </Select>
  );
}
