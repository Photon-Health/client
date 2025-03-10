import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect, createMemo } from 'solid-js';
import { PatientInfo, PatientMedHistory, AddressForm, Card, Text } from '@photonhealth/components';
import { Treatment } from '@photonhealth/sdk/dist/types';
import { message } from '../../validators';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';
import type { Address } from '../photon-prescribe-workflow';

const patientValidator = message(record(string(), any()), 'Please select a patient...');

const patientAddressValidator = message(
  record(string(), any()),
  'Please enter an address for patient...'
);

interface PatientCardStoreProp {
  patient?: {
    value?: { id: string; address: any };
    error: boolean;
  };
}

export const PatientCard = (props: {
  store: PatientCardStoreProp;
  actions: Record<string, (...args: any) => any>;
  patientId?: string;
  client?: PhotonClientStore;
  enableOrder?: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  enableMedHistory?: boolean;
  enableMedHistoryLinks?: boolean;
  hidePatientCard?: boolean;
}) => {
  const [newMedication, setNewMedication] = createSignal<Treatment | undefined>();
  undefined;
  const [showEditPatientView, setShowEditPatientView] = createSignal(false);
  const [showAddMedDialog, setShowAddMedDialog] = createSignal(false);
  const { actions, store } = PatientStore;
  const [isUpdating, setIsUpdating] = createSignal(false);

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
      actions.getSelectedPatient(props.client!.getSDK(), props.patientId);
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

  const currentPatientId = createMemo(
    // prefer the passed-in patientId if it exists
    () => props?.patientId || (props.store.patient?.value?.id as string)
  );

  // Listen for changes to the patient
  const patientId = createMemo(() => {
    if (isUpdating()) return '';
    return currentPatientId() ?? '';
  });

  // Show the address form only if the patient doesnt have an address
  const showAddressForm = createMemo(
    () =>
      props.store.patient?.value?.id && !props.store.patient?.value?.address && props.enableOrder
  );

  return (
    <div class="flex flex-col gap-8">
      <Show when={!props?.patientId}>
        <Card addChildrenDivider={true}>
          <div class="flex items-center justify-between">
            <Text color="gray">{props?.patientId ? 'Patient' : 'Select Patient'}</Text>
          </div>

          {/* Show Dropdown when no patientId is passed */}
          <photon-patient-select
            invalid={props.store.patient?.error ?? false}
            help-text={props.store.patient?.error}
            on:photon-patient-selected={updatePatient}
            selected={props.store.patient?.value?.id ?? props.patientId}
            sdk={props.client!.getSDK()}
          />
        </Card>
      </Show>
      <Show when={patientId() && !props.hidePatientCard}>
        <div>
          <PatientInfo
            patientId={patientId()}
            weight={props?.weight}
            weightUnit={props?.weightUnit}
            editPatient={
              props?.enableOrder && !showAddressForm()
                ? () => setShowEditPatientView(true)
                : undefined
            }
            address={props?.address || props.store.patient?.value?.address}
          />
          <photon-patient-dialog
            hide-create-prescription={true}
            open={showEditPatientView()}
            on:photon-patient-updated={() => {
              setIsUpdating(true);
              actions.getSelectedPatient(props.client!.getSDK(), props.store.patient!.value!.id);
              // Force a rerender of the above PatientInfo by quickly setting the patientId to null and then putting it back
              setTimeout(() => {
                setIsUpdating(false);
                setShowEditPatientView(false);
              }, 100);
            }}
            on:photon-patient-closed={() => {
              setShowEditPatientView(false);
            }}
            patient-id={patientId()}
          />
        </div>
      </Show>
      <Show when={props.enableMedHistory && patientId()}>
        <div>
          <PatientMedHistory
            patientId={patientId()}
            newMedication={newMedication()}
            enableLinks={props.enableMedHistoryLinks ?? false}
            openAddMedicationDialog={() => setShowAddMedDialog(true)}
            hideAddMedicationDialog={() => setShowAddMedDialog(false)}
          />
          <photon-add-medication-history-dialog
            title="Add Medication History"
            open={showAddMedDialog()}
            on:photon-medication-selected={(e: { detail: { medication: Treatment } }) => {
              setNewMedication(e.detail.medication);
            }}
            on:photon-medication-closed={() => {
              setShowAddMedDialog(false);
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
                ...props.store.patient!.value,
                address
              }
            });
          }}
        />
      </Show>
    </div>
  );
};
