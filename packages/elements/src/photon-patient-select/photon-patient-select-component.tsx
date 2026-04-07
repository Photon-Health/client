//Solid
import { customElement } from 'solid-element';

//Photon
import { usePhoton } from '@photonhealth/components';
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, onMount, untrack } from 'solid-js';
import { PatientStore } from '../stores/patient';
import { PhotonClient } from '@photonhealth/sdk';

const Component = (props: {
  label?: string;
  required: boolean;
  invalid: boolean;
  helpText?: string;
  selected?: string;
  formName?: string;
  disabled: boolean;
  forceLabelSize: boolean;
  sdk?: PhotonClient;
}) => {
  let ref: any;
  //context
  const client = usePhoton();
  const { store, actions } = PatientStore;
  let fetchMore: unknown;

  onMount(() => {
    actions.reset();
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
    if (store.selectedPatient.data) {
      return [
        store.selectedPatient.data,
        ...store.patients.data.filter((x) => x?.id !== store.selectedPatient.data!.id)
      ];
    } else {
      return store.patients.data;
    }
  });

  createEffect(async () => {
    if (props.selected && !store.selectedPatient.data) {
      untrack(async () => {
        await actions.getSelectedPatient(client ? client!.getSDK() : props.sdk!, props.selected!);
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
        label={props.label}
        forceLabelSize={props.forceLabelSize}
        required={props.required}
        disabled={props.disabled}
        placeholder="Select patient..."
        invalid={props.invalid}
        isLoading={store.patients.isLoading || store.selectedPatient.isLoading}
        hasMore={store.patients.data.length % 25 === 0 && !store.patients.finished}
        displayAccessor={(p) => p?.name?.full || ''}
        onSearchChange={async (s: string) =>
          (fetchMore = await actions.getPatients(client!.getSDK(), {
            name: s
          }))
        }
        onOpen={async () => {
          if (store.patients.data.length == 0) {
            fetchMore = await actions.getPatients(client!.getSDK());
          }
        }}
        onHide={async () => {
          fetchMore = await actions.getPatients(client!.getSDK());
        }}
        fetchMore={async () => {
          if (fetchMore) {
            // @ts-ignore
            fetchMore = await fetchMore();
          }
        }}
        noDataMsg={'No patients found'}
        helpText={props.helpText}
        selectedData={store.selectedPatient.data}
      />
    </div>
  );
};
customElement(
  'photon-patient-select',
  {
    label: undefined,
    required: false,
    invalid: false,
    helpText: undefined,
    selected: undefined,
    formName: undefined,
    disabled: false,
    forceLabelSize: false,
    sdk: undefined
  },
  Component
);
