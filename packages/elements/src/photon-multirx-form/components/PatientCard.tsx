import { message } from '../../validators';
import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect } from 'solid-js';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';
import { formatDate } from '../../utils';

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
  hideAddress?: boolean;
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
    <photon-card>
      <div class="flex flex-col gap-3">
        <p class="font-sans text-l font-medium">
          {props?.patientId ? 'Patient' : 'Select Patient'}
        </p>
        {/* Show Dropdown when no patientId is passed */}
        <Show when={!props?.patientId}>
          <photon-patient-select
            invalid={props.store['patient']?.error ?? false}
            help-text={props.store['patient']?.error}
            on:photon-patient-selected={updatePatient}
            selected={props.store['patient']?.value?.id ?? props.patientId}
            sdk={props.client!.getSDK()}
          ></photon-patient-select>
        </Show>
        {/* Show Patient Name when patientId is passed */}
        <Show when={props?.patientId}>
          <Show
            when={store?.selectedPatient?.data?.id}
            fallback={<sl-spinner style="font-size: 1rem;"></sl-spinner>}
          >
            <p class="font-sans text-gray-700">
              {store?.selectedPatient?.data?.name?.full},{' '}
              {formatDate(store?.selectedPatient?.data?.dateOfBirth || '')}
            </p>
          </Show>
        </Show>

        <Show when={props.store['patient']?.value?.id && props.enableOrder && !props.hideAddress}>
          <photon-patient-dialog
            open={dialogOpen()}
            on:photon-patient-updated={() => {
              actions.getSelectedPatient(props.client!.getSDK(), props.store['patient']?.value?.id);
            }}
            patient-id={props.store['patient'].value.id}
          ></photon-patient-dialog>
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
                  rounded: props.store['address']!.error
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
