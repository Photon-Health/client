import { For } from 'solid-js';
import Select from '../../../particles/Select';

function UnitSelect<T extends string>(props: {
  selected?: T;
  setSelected: (value: T) => void;
  options: T[];
}) {
  return (
    <Select value={props.selected} onChange={(e) => props.setSelected(e.currentTarget.value as T)}>
      <For each={props.options}>
        {(option) => (
          <option value={option} selected={props.selected === option}>
            {option}
          </option>
        )}
      </For>
    </Select>
  );
}

export default UnitSelect;
