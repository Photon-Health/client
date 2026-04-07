import { ComboBox } from '../particles/ComboBox';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createMemo, For, Show } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';

export const PatientSelect = (props: {
  selectedPatient?: Patient;
  patients: Patient[];
  loading: boolean;
  onSearch: (name?: string) => void;
  onSelect: (patient: Patient) => void;
}) => {
  const data = createMemo(() => {
    if (props.selectedPatient) {
      return [
        props.selectedPatient,
        ...props.patients.filter((x) => x.id !== props.selectedPatient!.id)
      ];
    } else {
      return props.patients;
    }
  });

  const handleSearch = debounce((s: string) => {
    props.onSearch(s);
  }, 250);

  return (
    <ComboBox
      value={props.selectedPatient || {}}
      setSelected={props.onSelect}
      onOpen={() => {
        if (props.patients.length === 0) {
          props.onSearch();
        }
      }}
    >
      <ComboBox.Input
        loading={props.loading}
        placeholder="Select patient..."
        onInput={(e) => handleSearch(e.currentTarget.value)}
        displayValue={(p: Patient) => {
          return p.name?.full || '';
        }}
      />
      <Show
        when={data().length > 0}
        fallback={
          <ComboBox.Options>
            <ComboBox.Option key={''} value={null} disabled={true}>
              {props.loading ? 'Loading...' : 'No patients found'}
            </ComboBox.Option>
          </ComboBox.Options>
        }
      >
        <ComboBox.Options>
          <For each={data()}>
            {(p: Patient) => (
              <ComboBox.Option key={p.id} value={p}>
                {p.name?.full || ''}
              </ComboBox.Option>
            )}
          </For>
        </ComboBox.Options>
      </Show>
    </ComboBox>
  );
};
