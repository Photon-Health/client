import { For } from 'solid-js';
import ComboBox from '../../../particles/ComboBox';

export type RecordWithId<T> = { id: string; name: T };
const arrayToRecordMap = <T extends {}>(arr: T[]): RecordWithId<T>[] =>
  arr.map((a, i) => ({ id: i.toString(), name: a }));

function UnitSelect<T extends string>({
  setSelected,
  options
}: {
  setSelected: (value: T) => void;
  options: T[];
}) {
  const optionsWithIds = arrayToRecordMap(options);

  return (
    <ComboBox value={optionsWithIds[0]} setSelected={(unit) => setSelected(unit.name)}>
      <ComboBox.Input displayValue={(unit: RecordWithId<any>) => unit.name} />
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
