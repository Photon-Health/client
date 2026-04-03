//Photon
import { ComboBox, InputGroup, usePhoton } from '@photonhealth/components';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createMemo, For, Show } from 'solid-js';
import { PatientActions, PatientStore } from '../../stores/patient';
import { debounce } from '@solid-primitives/scheduled';

export const PatientSelect = (props: {
  store: PatientStore;
  actions: PatientActions;
  onSelect: (patient: Patient) => void;
}) => {
  const client = usePhoton();

  const getData = createMemo(() => {
    if (props.store.selectedPatient.data) {
      return [
        props.store.selectedPatient.data,
        ...props.store.patients.data.filter((x) => x?.id !== props.store.selectedPatient.data!.id)
      ];
    } else {
      return props.store.patients.data;
    }
  });

  const handleSearch = debounce((s: string) => {
    props.actions.getPatients(client!.getSDK(), {
      name: s
    });
  }, 250);

  const handleSelect = (patient: Patient) => {
    props.actions.setSelectedPatient(patient);
    props.onSelect(patient);
  };

  return (
    <div>
      <InputGroup
        label="Select patient"
        hideLabel={true}
        loading={props.store.patients.isLoading || props.store.selectedPatient.isLoading}
      >
        <ComboBox
          value={props.store.selectedPatient.data || {}}
          setSelected={handleSelect}
          onOpen={() => {
            if (props.store.patients.data.length === 0) {
              props.actions.getPatients(client!.getSDK());
            }
          }}
        >
          <ComboBox.Input
            placeholder="Select patient..."
            onInput={(e) => handleSearch(e.currentTarget.value)}
            displayValue={(p: Patient) => {
              return p.name?.full || '';
            }}
          />
          <Show when={getData().length > 0}>
            <ComboBox.Options>
              <For each={getData()}>
                {(p: Patient) => (
                  <ComboBox.Option key={p.id} value={p}>
                    {p.name?.full || ''}
                  </ComboBox.Option>
                )}
              </For>
            </ComboBox.Options>
          </Show>
        </ComboBox>
      </InputGroup>
    </div>
  );
};
