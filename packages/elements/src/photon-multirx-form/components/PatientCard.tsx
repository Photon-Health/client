import { message } from '../../validators';
import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect, createMemo } from 'solid-js';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';
import { formatDate } from '../../utils';
import { PrescribeAddress, PrescribePatient } from '..';

const patientValidator = message(record(string(), any()), 'Please select a patient...');

const patientAddressValidator = message(
  record(string(), any()),
  'Please enter an address for patient...'
);

export const PatientCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  patientId?: string;
  patient?: PrescribePatient;
  address?: PrescribeAddress;
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

  const fetchOrCreatePatient = async () => {
    const { data } = await props.client!.getSDK().clinical.patient.getPatients({
      name: `${props?.patient?.firstName} ${props?.patient?.lastName}`
    });

    if (data.patients.length > 0) {
      // Patient already exists
      const patient = data.patients.find(
        (patient) => props?.patient?.externalId === patient.externalId
      );

      if (patient) {
        return actions.setSelectedPatient(patient);
      }
    }

    // Else create patient
    const createPatientMutation = props.client!.getSDK().clinical.patient.createPatient({});
    const mutation = await createPatientMutation({
      variables: {
        externalId: props?.patient?.externalId,
        name: {
          first: props?.patient?.firstName,
          last: props?.patient?.lastName
        },
        sex: props?.patient?.sex,
        dateOfBirth: props?.patient?.dateOfBirth,
        phone: props?.patient?.phone,
        email: props?.patient?.email || '',
        ...(props?.address
          ? {
              address: {
                street1: props?.address?.street1,
                street2: props?.address?.street2,
                city: props?.address?.city,
                state: props?.address?.state,
                postalCode: props?.address?.postalCode,
                country: props?.address?.country || 'US'
              }
            }
          : {})
      },
      awaitRefetchQueries: false
    });
    if (mutation?.data?.createPatient) {
      return actions.setSelectedPatient(mutation?.data?.createPatient);
    }
    console.error('Error creating patient', mutation?.errors || '');
  };

  onMount(() => {
    if (props?.patientId) {
      // fetch patient on mount when patientId is passed
      return actions.getSelectedPatient(props.client!.getSDK(), props.patientId);
    }
    if (props?.patient) {
      // fetch or create patient when patient is passed
      return fetchOrCreatePatient();
    }
  });

  const hasProvidedPatient = createMemo(() => props?.patientId || props?.patient);

  createEffect(() => {
    if (store?.selectedPatient?.data && hasProvidedPatient()) {
      // update patient when passed-in patient (patientId) is fetched
      updatePatient({ detail: { patient: store?.selectedPatient?.data } });
    }
  });

  return (
    <photon-card>
      <div class="flex flex-col gap-3">
        <p class="font-sans text-l font-medium">
          {hasProvidedPatient() ? 'Patient' : 'Select Patient'}
        </p>
        {/* Show Dropdown when no patient is passed */}
        <Show when={!hasProvidedPatient()}>
          <photon-patient-select
            invalid={props.store['patient']?.error ?? false}
            help-text={props.store['patient']?.error}
            on:photon-patient-selected={updatePatient}
            selected={props.store['patient']?.value?.id ?? props.patientId}
            sdk={props.client!.getSDK()}
          />
        </Show>
        {/* Show Patient Name when patient is passed */}
        <Show when={hasProvidedPatient()}>
          <Show
            when={store?.selectedPatient?.data?.id}
            fallback={<sl-spinner style={{ 'font-size': '1rem' }} />}
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
          />
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
