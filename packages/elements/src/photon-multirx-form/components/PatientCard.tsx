import { message } from '../../validators';
import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect } from 'solid-js';
import { PatientInfo } from '@photonhealth/components';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';

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
  hideAddress?: boolean;
  weight?: number;
}) => {
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const { actions, store } = PatientStore;

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

  const updatePatient = (e: any) => {
    props.actions.updateFormValue({
      key: 'patient',
      value: e.detail.patient
    });
    if (props.enableOrder && !props.hideAddress) {
      // update address when you want to allow send order
      // but the address hasn't been manually overridden
      props.actions.updateFormValue({
        key: 'address',
        value: e.detail.patient.address
      });
    }
  };

  onMount(() => {
    if (props?.patientId) {
      // fetch patient on mount when patientId is passed
      actions.getSelectedPatient(props.client!.getSDK(), props.patientId);
    }
  });

  createEffect(() => {
    if (store?.selectedPatient?.data && props?.patientId) {
      // update patient when passed-in patient (patientId) is fetched
      updatePatient({ detail: { patient: store?.selectedPatient?.data } });
    }
  });

  return (
    <div class="gap-8">
      <Show when={!props?.patientId}>
        <photon-card>
          <div class="flex flex-col gap-3">
            <p class="font-sans text-l font-medium">
              {props?.patientId ? 'Patient' : 'Select Patient'}
            </p>
            {/* Show Dropdown when no patientId is passed */}
            <photon-patient-select
              invalid={props.store['patient']?.error ?? false}
              help-text={props.store['patient']?.error}
              on:photon-patient-selected={updatePatient}
              selected={props.store['patient']?.value?.id ?? props.patientId}
              sdk={props.client!.getSDK()}
            />
          </div>
        </photon-card>
      </Show>

      <photon-card>
        <Show when={props.store['patient']?.value?.id && !props.hideAddress}>
          <photon-patient-dialog
            open={dialogOpen()}
            on:photon-patient-updated={() => {
              actions.getSelectedPatient(props.client!.getSDK(), props.store['patient']?.value?.id);
            }}
            patient-id={props.store['patient'].value.id}
          />
          <PatientInfo patientId={props.patientId!} weight={props?.weight} />
        </Show>
      </photon-card>
    </div>
  );
};
