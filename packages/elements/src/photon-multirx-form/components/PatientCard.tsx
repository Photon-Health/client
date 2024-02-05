import { AddressForm, Card, PatientInfo, PatientMedHistory, Text } from '@photonhealth/components';
import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { any, record, string } from 'superstruct';
import { PatientStore } from '../../stores/patient';
import { message } from '../../validators';
import type { Address } from '../index';
import { usePhotonWrapper } from '../../store-context';

const patientValidator = message(record(string(), any()), 'Please select a patient...');

const patientAddressValidator = message(
  record(string(), any()),
  'Please enter an address for patient...'
);

export const PatientCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  patientId?: string;
  enableOrder?: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  enableMedHistory?: boolean;
}) => {
  const photon = usePhotonWrapper();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sdk = createMemo(() => photon!().getSDK());
  const [newMedication, setNewMedication] = createSignal<Medication | SearchMedication | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [medDialogOpen, setMedDialogOpen] = createSignal(false);
  const { actions, store } = PatientStore;

  onMount(() => {
    props.actions.registerValidator({
      key: 'patient',
      validator: patientValidator
    });

    if (props.enableOrder) {
      props.actions.registerValidator({
        key: 'address',
        validator: patientAddressValidator
      });
    }

    if (props?.patientId) {
      // fetch patient on mount when patientId is passed
      actions.getSelectedPatient(sdk(), props.patientId);
    }
  });

  const updatePatient = (e: any) => {
    props.actions.updateFormValue({
      key: 'patient',
      value: e.detail.patient
    });
    if (props.enableOrder && !props.address) {
      // update address when you want to allow send order
      // but the address hasn't been manually overridden
      props.actions.updateFormValue({
        key: 'address',
        value: e.detail.patient.address
      });
    }
  };

  createEffect(() => {
    if (store?.selectedPatient?.data && props?.patientId) {
      // update patient when passed-in patient (patientId) is fetched
      updatePatient({ detail: { patient: store?.selectedPatient?.data } });
    }
  });

  const patientId = createMemo(() => props.store.patient?.value?.id || props?.patientId);
  // Show the address form only if the patient doesnt have an address
  const showAddressForm = createMemo(
    () =>
      props.store.patient?.value?.id && !props.store.patient?.value?.address && props.enableOrder
  );

  return (
    <div class="flex flex-col gap-8">
      <Show when={!props?.patientId}>
        <Card>
          <div class="flex items-center justify-between">
            <Text color="gray">{props?.patientId ? 'Patient' : 'Select Patient'}</Text>
          </div>

          {/* Show Dropdown when no patientId is passed */}
          <photon-patient-select
            invalid={props.store.patient?.error ?? false}
            help-text={props.store.patient?.error}
            on:photon-patient-selected={updatePatient}
            selected={props.store.patient?.value?.id ?? props.patientId}
            sdk={sdk()}
          />
        </Card>
      </Show>
      <Show when={patientId()}>
        <div>
          <PatientInfo
            patientId={patientId()}
            weight={props?.weight}
            weightUnit={props?.weightUnit}
            editPatient={
              props?.enableOrder && !showAddressForm() ? () => setDialogOpen(true) : undefined
            }
            address={props?.address || props.store.patient?.value?.address}
          />
          <photon-patient-dialog
            hide-create-prescription={true}
            open={dialogOpen()}
            on:photon-patient-updated={() => {
              actions.getSelectedPatient(sdk(), props.store.patient?.value?.id);
              setDialogOpen(false);
            }}
            on:photon-patient-closed={() => {
              setDialogOpen(false);
            }}
            patient-id={patientId()}
          />
        </div>
      </Show>
      <Show when={props.enableMedHistory && patientId()}>
        <div>
          <PatientMedHistory
            patientId={patientId()}
            openAddMedication={() => setMedDialogOpen(true)}
            newMedication={newMedication()}
          />
          <photon-med-search-dialog
            title="Add Medication History"
            open={medDialogOpen()}
            with-concept={true}
            on:photon-medication-selected={(e: {
              detail: { medication: Medication | SearchMedication };
            }) => {
              setNewMedication(e.detail.medication);
              setMedDialogOpen(false);
            }}
            on:photon-medication-closed={() => {
              setMedDialogOpen(false);
            }}
          />
        </div>
      </Show>
      <Show when={showAddressForm()}>
        <AddressForm
          patientId={patientId()}
          setAddress={(address: Address) => {
            props.actions.updateFormValue({
              key: 'address',
              value: address
            });
            props.actions.updateFormValue({
              key: 'patient',
              value: {
                ...props.store.patient.value,
                address
              }
            });
          }}
        />
      </Show>
    </div>
  );
};
