import { ComboBox } from '../particles/ComboBox';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createMemo, For, Show } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';
import { format } from 'date-fns';
import clsx from 'clsx';

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
    <ComboBox
      value={props.selectedPatient || {}}
      setSelected={props.onSelect}
      onOpen={() => {
        if (props.patients.length === 0) {
          props.onInitialFetch();
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
                {({ active }) => (
                  <div class="w-full flex justify-between items-center gap-x-2">
                    {/* Styling accounts for wrapping long names on mobile */}
                    <span class="min-w-0 whitespace-normal">{p.name.full}</span>
                    <span class={clsx('shrink-0', active ? 'text-white' : 'text-gray-500')}>
                      {format(p.dateOfBirth, 'M/d/yyyy')}
                    </span>
                  </div>
                )}
              </ComboBox.Option>
            )}
          </For>
        </ComboBox.Options>
      </Show>
    </ComboBox>
  );
};
