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

const monthNumberToAbreviation = new Map([
  ['01', 'Jan'],
  ['02', 'Feb'],
  ['03', 'Mar'],
  ['04', 'Apr'],
  ['05', 'May'],
  ['06', 'Jun'],
  ['07', 'Jul'],
  ['08', 'Aug'],
  ['09', 'Sep'],
  ['10', 'Oct'],
  ['11', 'Nov'],
  ['12', 'Dec']
]);

/**
 * @param rawDate Patient AWSDate in the form of YYYY-MM-DD
 * Change the ambiguous AWS Date form into something more human readable
 * In the form of DD-MMM-YYYY
 */
function formatDate(rawDate: string): string {
  const dateSplit = rawDate.split('-');
  const day = dateSplit[2];
  const month = dateSplit[1];
  const year = dateSplit[0];
  if (!monthNumberToAbreviation.has(month)) {
    return 'Unknown';
  }
  return `${day}-${monthNumberToAbreviation.get(month)}-${year}`;
}

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
        displayAccessor={(p) => {
          if (!p) return '';
          const element = (
            <div class="flex justify-between items-center">
              <span>{p.name?.full}</span>{' '}
              <span class="text-sm text-gray-500">{formatDate(String(p.dateOfBirth))}</span>
            </div>
          );
          return element;
        }}
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
