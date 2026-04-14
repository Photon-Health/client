import { ComboBox } from '../particles/ComboBox';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createMemo, For, Show } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';
import clsx from 'clsx';
import formatDate from '../utils/formatDate';

export const PatientSelect = (props: {
  selectedPatient?: Patient;
  patients: Patient[];
  loading: boolean;
  onInitialFetch: () => void;
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
    <ComboBox<Patient>
      value={props.selectedPatient}
      setSelected={(patient) => patient && props.onSelect(patient)}
      onOpen={() => {
        if (props.patients.length === 0) {
          props.onInitialFetch();
        }
      }}
    >
      <ComboBox.Input<Patient>
        loading={props.loading}
        placeholder="Select patient..."
        onInput={(e) => handleSearch(e.currentTarget.value)}
        displayValue={(p) => {
          return p.name?.full || '';
        }}
      />
      <Show
        when={data().length > 0}
        fallback={
          <ComboBox.Options>
            <ComboBox.Option key="empty" value={{ id: 'empty' } as Patient} disabled={true}>
              {props.loading ? 'Loading...' : 'No patients found'}
            </ComboBox.Option>
          </ComboBox.Options>
        }
      >
        <ComboBox.Options>
          <For each={data()}>
            {(p: Patient) => <ComboBox.Option key={p.id} value={p} render={PatientOption} />}
          </For>
        </ComboBox.Options>
      </Show>
    </ComboBox>
  );
};

const PatientOption = (props: { value: Patient; active: boolean }) => (
  <div class="w-full flex justify-between items-center gap-x-2">
    {/* Styling accounts for wrapping long names on mobile */}
    <span class="min-w-0 whitespace-normal">{props.value.name.full}</span>
    <span class={clsx('shrink-0', props.active ? 'text-white' : 'text-gray-500')}>
      {formatDate(props.value.dateOfBirth)}
    </span>
  </div>
);
