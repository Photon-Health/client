import { message } from '../../validators';
import { string, any, record } from 'superstruct';
import { createSignal, Show } from 'solid-js';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';

const patientValidator = message(record(string(), any()), 'Please select a patient...');

const patientAddressValidator = message(
  record(string(), any()),
  'Please enter an address for patient...'
);

export const PatientCard = (props: {
  store: Record<string, any>;
  actions: Record<string, Function>;
  patientId?: string;
  client?: PhotonClientStore;
  enableOrder?: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const { actions } = PatientStore;

  props.actions.registerValidator({
    key: 'patient',
    validator: patientValidator,
  });

  if (props.enableOrder) {
    props.actions.registerValidator({
      key: 'address',
      validator: patientAddressValidator,
    });
  }

  return (
    <photon-card>
      <div class="flex flex-col gap-3">
        <p class="font-sans text-l font-medium">Select Patient</p>
        <photon-patient-select
          invalid={props.store['patient']?.error ?? false}
          help-text={props.store['patient']?.error}
          on:photon-patient-selected={(e: any) => {
            props.actions.updateFormValue({
              key: 'patient',
              value: e.detail.patient,
            });
            if (props.enableOrder) {
              props.actions.updateFormValue({
                key: 'address',
                value: e.detail.patient.address,
              });
            }
          }}
          selected={props.store['patient']?.value?.id ?? props.patientId}
          sdk={props.client!.getSDK()}
        ></photon-patient-select>
        <Show when={props.store['patient']?.value?.id && props.enableOrder}>
          <photon-update-patient-dialog
            open={dialogOpen()}
            on:photon-patient-updated={() => {
              actions.getSelectedPatient(props.client!.getSDK(), props.store['patient']?.value?.id);
            }}
            patient-id={props.store['patient'].value.id}
          ></photon-update-patient-dialog>
          <Show when={props.store['patient']?.value}>
            <p class="font-sans text-sm font-medium">Patient Address</p>
            <Show when={props.store['patient']!.value.address}>
              <div class="flex flex-col font-sans text-gray-700">
                <p>{props.store['patient']!.value.address.street1}</p>
                {props.store['patient']!.value.address.street2 ? (
                  <p>{props.store['patient']!.value.address.street2}</p>
                ) : null}
                <div class="flex flex-row gap-1">
                  <div class="flex flex-row">
                    <p>{props.store['patient']!.value.address.city},</p>
                    <p>{props.store['patient']!.value.address.state}</p>
                  </div>
                  <p>{props.store['patient']!.value.address.postalCode}</p>
                </div>
              </div>
            </Show>
            <Show when={!props.store['patient']!.value.address}>
              <p
                class="italic font-sans text-gray-500"
                classList={{
                  'p-2': props.store['address']!.error,
                  'border-red-500': props.store['address']!.error,
                  'border-2': props.store['address']!.error,
                  rounded: props.store['address']!.error,
                }}
              >
                Please edit patient and add address
              </p>
              <Show when={props.store['address'].error}>
                <p class="font-sans text-red-500 text-sm">{props.store['address'].error}</p>
              </Show>
            </Show>
          </Show>
          <photon-button
            class="self-end"
            variant="outline"
            on:photon-clicked={() => {
              setDialogOpen(false);
              setDialogOpen(true);
            }}
          >
            Edit Patient
          </photon-button>
        </Show>
      </div>
    </photon-card>
  );
};
