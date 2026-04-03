//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '@photonhealth/components';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, onMount, untrack } from 'solid-js';
import { PatientActions, PatientStore } from '../stores/patient';

const PatientSelect = (props: {
  store: PatientStore;
  actions: PatientActions;
  invalid: boolean;
  helpText?: string;
  selected?: string;
}) => {
  let ref: any;
  //context
  const client = usePhoton();
  let fetchMore: unknown;

  onMount(() => {
    props.actions.reset();
  });

  const dispatchSelected = (patient: Patient) => {
    const event = new CustomEvent('photon-patient-selected', {
      composed: true,
      bubbles: true,
      detail: {
        patient
      }
    });
    ref?.dispatchEvent(event);
  };

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

  createEffect(async () => {
    if (props.selected && !props.store.selectedPatient.data) {
      untrack(async () => {
        await props.actions.getSelectedPatient(client.getSDK(), props.selected!);
      });
    }
  });

  return (
    <div
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchSelected(e.detail.data);
      }}
    >
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
customElement(
  'photon-patient-select',
  {
    store: {} as PatientStore,
    actions: {} as PatientActions,
    invalid: false,
    helpText: undefined,
    selected: undefined
  },
  PatientSelect
);
