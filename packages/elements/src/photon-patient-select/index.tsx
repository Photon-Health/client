//Solid
import { customElement } from 'solid-element';

//Photon
import { PhotonDropdown } from '../photon-dropdown';

//Types
import { Patient } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, onMount, untrack } from 'solid-js';
import { usePhotonWrapper } from '../store-context';
import { PatientStore } from '../stores/patient';

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
    forceLabelSize: false
  },
  (props: {
    label?: string;
    required: boolean;
    invalid: boolean;
    helpText?: string;
    selected?: string;
    formName?: string;
    disabled: boolean;
    forceLabelSize: boolean;
  }) => {
    let ref: any;
    //context
    const photon = usePhotonWrapper();
    if (!photon) {
      console.error(
        '[photon-patient-dialog] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-photon element'
      );
      return (
        <div>
          [photon-patient-dialog] No valid PhotonClient instance was provided. Please ensure you are
          wrapping the element in a photon-photon element
        </div>
      );
    }

    const sdk = photon().getSDK();
    const { store, actions } = PatientStore;
    let fetchMore: Awaited<ReturnType<(typeof actions)['getPatients']>>;

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
          await actions.getSelectedPatient(sdk, props.selected!);
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
            (fetchMore = await actions.getPatients(sdk, {
              name: s
            }))
          }
          onOpen={async () => {
            if (store.patients.data.length == 0) {
              fetchMore = await actions.getPatients(sdk);
            }
          }}
          onHide={async () => {
            fetchMore = await actions.getPatients(sdk);
          }}
          fetchMore={async () => {
            if (fetchMore) {
              fetchMore = await fetchMore();
            }
          }}
          noDataMsg={'No patients found'}
          helpText={props.helpText}
          selectedData={store.selectedPatient.data}
        />
      </div>
    );
  }
);
