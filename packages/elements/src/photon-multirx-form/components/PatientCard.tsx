import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect, createMemo } from 'solid-js';
import { PatientInfo, PatientMedHistory, AddressForm, Card, Text } from '@photonhealth/components';
import { Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import { message } from '../../validators';
import { PatientStore } from '../../stores/patient';
import { PhotonClientStore } from '../../store';
import type { Address } from '../index';

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
}) => {
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
    console.log(store?.selectedPatient?.data, props?.patientId);
    if (store?.selectedPatient?.data && props?.patientId) {
      // update patient when passed-in patient (patientId) is fetched
      // updatePatient({ detail: { patient: store?.selectedPatient?.data } });
    }
  });

  // const patientId = createMemo(() => props.store.patient?.value?.id || props?.patientId);
  // // Show the address form only if the patient doesnt have an address
  // const showAddressForm = createMemo(
  //   () =>
  //     props.store.patient?.value?.id && !props.store.patient?.value?.address && props.enableOrder
  // );

  return <div class="flex flex-col gap-8">what</div>;
};
