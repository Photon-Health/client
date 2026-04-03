//Photon
import { ComboBox, InputGroup, usePhoton } from '@photonhealth/components';
import { PhotonDropdown } from '../../photon-dropdown';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createMemo, For, onMount, Show } from 'solid-js';
import { PatientActions, PatientStore } from '../../stores/patient';
import { debounce } from '@solid-primitives/scheduled';

export const PatientSelect = (props: {
  store: PatientStore;
  actions: PatientActions;
  invalid: boolean;
  helpText?: string;
  onSelect: (patient: Patient) => void;
}) => {
  let ref: any;
  //context
  const client = usePhoton();
  let fetchMore: unknown;

  onMount(() => {
    props.actions.reset();
  });

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
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        props.onSelect(e.detail.data);
      }}
    >
      <InputGroup
        label="Select patient"
        hideLabel={true}
        loading={props.store.patients.isLoading || props.store.selectedPatient.isLoading}
        helpText={props.helpText}
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
              console.log({ value: p });
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
      <PhotonDropdown
        data={getData()}
        required={false}
        placeholder="Select patient..."
        invalid={props.invalid}
        isLoading={props.store.patients.isLoading || props.store.selectedPatient.isLoading}
        hasMore={props.store.patients.data.length % 25 === 0 && !props.store.patients.finished}
        displayAccessor={(p) => p?.name?.full || ''}
        onSearchChange={async (s: string) =>
          (fetchMore = await props.actions.getPatients(client!.getSDK(), {
            name: s
          }))
        }
        onOpen={async () => {
          if (props.store.patients.data.length == 0) {
            fetchMore = await props.actions.getPatients(client!.getSDK());
          }
        }}
        onHide={async () => {
          fetchMore = await props.actions.getPatients(client!.getSDK());
        }}
        fetchMore={async () => {
          if (fetchMore) {
            // @ts-ignore
            fetchMore = await fetchMore();
          }
        }}
        noDataMsg={'No patients found'}
        helpText={props.helpText}
        selectedData={props.store.selectedPatient.data}
      />
    </div>
  );
};
