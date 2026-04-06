import { any, record, string } from 'superstruct';
import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js';
import {
  AddressForm,
  Card,
  PatientSelect,
  PatientInfo,
  PatientMedHistory,
  PhotonClientStore,
  Text,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import { Address, Patient, Treatment } from '@photonhealth/sdk/dist/types';
import { message } from '../../validators';
import { createPatientStore } from '../../stores/patient';

const patientValidator = message(record(string(), any()), 'Please select a patient...');

const patientAddressValidator = message(
  record(string(), any()),
  'Please enter an address for patient...'
);

export const PatientCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  patientId?: string;
  client?: PhotonClientStore;
  enableOrder?: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  enableMedHistory?: boolean;
  enableMedHistoryLinks?: boolean;
  enableMedHistoryRefillButton?: boolean;
  hidePatientCard?: boolean;
  showAddressForm: boolean;
  optionalPatientAddress?: boolean;
}) => {
  const { dispatchAnalyticsTrackEvent } = usePrescribeEventDispatch();
  const [newMedication, setNewMedication] = createSignal<Treatment | undefined>();
  const [showEditPatientView, setShowEditPatientView] = createSignal(false);
  const [showAddMedDialog, setShowAddMedDialog] = createSignal(false);
  const { actions: patientActions, store: patientStore } = createPatientStore();
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

    if (props.patientId) {
      // fetch patient on mount when patientId is passed
      patientActions.getSelectedPatient(props.client!.getSDK(), props.patientId);
    }
  });

  createEffect(() => {
    if (patientStore.selectedPatient.data) {
      // update patient when passed-in patient (patientId) is fetched
      updateFormPatient(patientStore.selectedPatient.data, { trackInteraction: false });
    }
  });

  const updateFormPatient = (patient: Patient, { trackInteraction = true } = {}) => {
    props.actions.updateFormValue({
      key: 'patient',
      value: patient
    });
    if (trackInteraction) {
      dispatchAnalyticsTrackEvent('fieldInteraction', {
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        patientId: patient.id
      });
    }
    // TODO: keep this logic here for now,
    // need to investigate how different addresses are stored in formStore
    if (props.enableOrder && !props.address) {
      // update address when you want to allow send order
      // but the address hasn't been manually overridden
      props.actions.updateFormValue({
        key: 'address',
        value: patient.address
      });
    }
  };

  // Listen for changes to the patient
  const patientId = createMemo(() => {
    if (isUpdating()) {
      return '';
    }
    // prefer the passed-in patientId if it exists
    return props.patientId || patientStore.selectedPatient.data?.id || '';
  });

  return (
    <div class="flex flex-col gap-8">
      <Show when={!props.patientId}>
        <Card addChildrenDivider={true}>
          <div class="flex items-center justify-between">
            <Text color="gray">Select Patient</Text>
          </div>

          {/* Show Dropdown when no patientId is passed */}
          <PatientSelect
            selectedPatient={patientStore.selectedPatient.data}
            patients={patientStore.patients.data}
            loading={patientStore.patients.isLoading || patientStore.selectedPatient.isLoading}
            onSearch={(name) =>
              patientActions.getPatients(props.client!.getSDK(), name ? { name } : undefined)
            }
            onSelect={(patient: Patient) => {
              patientActions.setSelectedPatient(patient);
              updateFormPatient(patient);
            }}
          />
        </Card>
      </Show>
      <Show when={!props.hidePatientCard && patientId()}>
        <div>
          <PatientInfo
            patient={patientStore.selectedPatient.data}
            loading={patientStore.selectedPatient.isLoading}
            weight={props.weight}
            weightUnit={props.weightUnit}
            editPatient={
              // If showAddressForm, don't enable Edit patient button
              // until patient address is collected
              props.enableOrder && !props.showAddressForm
                ? () => {
                    dispatchAnalyticsTrackEvent('ctaClicked', {
                      name: 'Patient Edited'
                    });
                    setShowEditPatientView(true);
                  }
                : undefined
            }
            address={props.address || props.store.patient?.value?.address}
          />
          <photon-patient-dialog
            patient-id={patientId()}
            hide-create-prescription={true}
            open={showEditPatientView()}
            optional-patient-address={props.optionalPatientAddress}
            on:photon-patient-updated={() => {
              setIsUpdating(true);
              patientActions.getSelectedPatient(
                props.client!.getSDK(),
                patientStore.selectedPatient.data!.id
              );
              // Force a rerender of the above PatientInfo by quickly setting the patientId to null and then putting it back
              setTimeout(() => {
                setIsUpdating(false);
                setShowEditPatientView(false);
              }, 100);
            }}
            on:photon-patient-closed={() => {
              setShowEditPatientView(false);
            }}
          />
        </div>
      </Show>
      <Show when={props.enableMedHistory && patientId()}>
        <div>
          <PatientMedHistory
            patientId={patientId()}
            newMedication={newMedication()}
            enableLinks={props.enableMedHistoryLinks ?? false}
            enableRefillButton={props.enableMedHistoryRefillButton ?? false}
            openAddMedicationDialog={() => setShowAddMedDialog(true)}
            hideAddMedicationDialog={() => setShowAddMedDialog(false)}
          />
          <photon-add-medication-history-dialog
            open={showAddMedDialog()}
            on:photon-medication-selected={(e: { detail: { medication: Treatment } }) => {
              setNewMedication(e.detail.medication);
              dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Added To Medication History' });
            }}
            on:photon-medication-closed={() => {
              setShowAddMedDialog(false);
            }}
          />
        </div>
      </Show>
      <Show when={props.showAddressForm && patientId()}>
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
