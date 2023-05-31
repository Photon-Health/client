import { For } from 'solid-js';
import ComboBox from '../../../particles/ComboBox';

export type RecordWithId = { id: string; name: string };
const arrayToRecordMap = (arr: string[]): RecordWithId[] =>
  arr.map((a, i) => ({ id: i.toString(), name: a }));

function UnitSelect<T extends string>(props: {
  setSelected: (value: T) => void;
  options: T[];
  initialIdx?: number;
}) {
  const optionsWithIds = arrayToRecordMap(props.options);

  return (
    <ComboBox
      value={optionsWithIds[props.initialIdx || 0]}
      setSelected={(unit) => props.setSelected(unit.name)}
    >
      <ComboBox.Input displayValue={(unit: RecordWithId) => unit.name} />
      <ComboBox.Options>
        <For each={optionsWithIds}>
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
