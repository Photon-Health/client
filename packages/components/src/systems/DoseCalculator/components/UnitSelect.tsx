import { For } from 'solid-js';
import ComboBox from '../../../particles/ComboBox';
import { RecordWithId } from '..';

function UnitSelect<T extends string>({
  value,
  setSelected,
  options
}: {
  value: RecordWithId<T>;
  setSelected: (value: RecordWithId<T>) => void;
  options: RecordWithId<T>[];
}) {
  return (
    <ComboBox value={value} setSelected={setSelected}>
      <ComboBox.Input displayValue={(unit: RecordWithId<any>) => unit.name} />
      <ComboBox.Options>
        <For each={options}>
          {(unit) => (
            <ComboBox.Option key={unit.id} value={unit}>
              {unit.name}
            </ComboBox.Option>
          )}
        </For>
      </ComboBox.Options>
    </ComboBox>
  );
}

export default UnitSelect;
