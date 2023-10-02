import { For, createMemo } from 'solid-js';
import ComboBox from '../../../particles/ComboBox';

export type RecordWithId = { id: string; name: string };
const arrayToRecordMap = (arr: string[]): RecordWithId[] =>
  arr.map((a, i) => ({ id: i.toString(), name: a }));

function UnitSelect<T extends string>(props: {
  setSelected: (value: T) => void;
  options: T[];
  initialIdx?: number;
  initialValue?: T;
}) {
  const optionsWithIds = createMemo(() => arrayToRecordMap(props.options));
  const idx = createMemo(() => {
    if (props.initialIdx) return props.initialIdx;
    if (props.initialValue) return props.options.indexOf(props.initialValue);
    return 0;
  });

  return (
    <ComboBox value={optionsWithIds()[idx()]} setSelected={(unit) => props.setSelected(unit.name)}>
      <ComboBox.Input displayValue={(unit: RecordWithId) => unit.name} />
      <ComboBox.Options>
        <For each={optionsWithIds()}>
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
