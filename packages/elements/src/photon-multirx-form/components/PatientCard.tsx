import { any, record, string } from 'superstruct';
import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js';
import {
  AddressForm,
  Card,
  PatientInfo,
  PatientMedHistory,
  PhotonClientStore,
  Text,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import { Patient, Treatment } from '@photonhealth/sdk/dist/types';
import { message } from '../../validators';
import { createPatientStore } from '../../stores/patient';
import type { Address } from './PrescribeWorkflow';
import { PatientSelect } from './PatientSelect';

const hasUsableAddress = (address?: {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) => {
  if (!address) {
    return false;
  }
  return Boolean(
    address.street1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim()
  );
};

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
  optionalPatientAddress?: boolean;
}) => {
  const { dispatchAnalytics } = usePrescribeEventDispatch();
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

    if (props?.patientId) {
      // fetch patient on mount when patientId is passed
      patientActions.getSelectedPatient(props.client!.getSDK(), props.patientId);
    }
  });

  const updateFormPatient = (patient: Patient, { trackInteraction = true } = {}) => {
    props.actions.updateFormValue({
      key: 'patient',
      value: patient
    });
    if (trackInteraction) {
      dispatchAnalytics({
        trackEventType: 'prescription_patient_changed',
        properties: { patientId: patient.id }
      });
    }
    if (props.enableOrder && !props.address) {
      // update address when you want to allow send order
      // but the address hasn't been manually overridden
      props.actions.updateFormValue({
        key: 'address',
        value: patient.address
      });
    }
  };

  createEffect(() => {
    if (patientStore?.selectedPatient?.data && props?.patientId) {
      // update patient when passed-in patient (patientId) is fetched
      updateFormPatient(patientStore?.selectedPatient?.data, { trackInteraction: false });
    }
  });

  // Listen for changes to the patient
  const patientId = createMemo(() => {
    if (isUpdating()) {
      return '';
    }
    // prefer the passed-in patientId if it exists
    return props?.patientId || props.store.patient?.value?.id || '';
  });

  const hasAddress = createMemo(() => {
    const address = props.store.address?.value || props.store.patient?.value?.address;
    return hasUsableAddress(address);
  });
  const hasPreferredPharmacy = createMemo(() => {
    return Boolean(props.store.patient?.value?.preferredPharmacies?.length);
  });

  // Show the address form only if the patient doesnt have an address
  // and the address is not marked as optional in the provider UX
  const showAddressForm = createMemo(() => {
    if (!props.store.patient?.value?.id || !props.enableOrder) {
      return false;
    }
    if (!props.optionalPatientAddress) {
      return !hasAddress();
    }
    // optionalpatientaddress skips address requirement unless a preferred pharmacy is set
    return hasPreferredPharmacy() && !hasAddress();
  });

  return (
    <div class="flex flex-col gap-8">
      <Show when={!props?.patientId}>
        <Card addChildrenDivider={true}>
          <div class="flex items-center justify-between">
            <Text color="gray">Select Patient</Text>
          </div>

          {/* Show Dropdown when no patientId is passed */}
          <PatientSelect
            store={patientStore}
            actions={patientActions}
            invalid={props.store.patient?.error ?? false}
            helpText={props.store.patient?.error}
            selected={patientId()}
            onSelect={updateFormPatient}
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
            store={patientStore}
            actions={patientActions}
            hide-create-prescription={true}
            open={showEditPatientView()}
            patient-id={patientId()}
            optional-patient-address={props.optionalPatientAddress}
            on:photon-patient-updated={() => {
              setIsUpdating(true);
              patientActions.getSelectedPatient(
                props.client!.getSDK(),
                props.store.patient!.value!.id
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
              dispatchAnalytics({
                trackEventType: 'add_to_medication_history'
              });
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
