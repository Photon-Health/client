import { string, any, record } from 'superstruct';
import { createSignal, onMount, Show, createEffect, createMemo } from 'solid-js';
import { PatientInfo, PatientMedHistory } from '@photonhealth/components';
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
    if (store?.selectedPatient?.data && props?.patientId) {
      // update patient when passed-in patient (patientId) is fetched
      updatePatient({ detail: { patient: store?.selectedPatient?.data } });
    }
  });

  const patientId = createMemo(() => props.store['patient']?.value?.id || props?.patientId);

  return (
    <div class="flex flex-col gap-8">
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
      <Show when={patientId()}>
        <photon-card>
          <PatientInfo
            patientId={patientId()}
            weight={props?.weight}
            weightUnit={props?.weightUnit}
            editPatient={props?.enableOrder ? () => setDialogOpen(true) : undefined}
            address={props?.address}
          />
          <photon-patient-dialog
            hide-create-prescription={true}
            open={dialogOpen()}
            on:photon-patient-updated={() => {
              actions.getSelectedPatient(props.client!.getSDK(), props.store['patient']?.value?.id);
            }}
            patient-id={patientId()}
          />
        </photon-card>
      </Show>
      <Show when={props.enableMedHistory && patientId()}>
        <photon-card>
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
        </photon-card>
      </Show>
    </div>
  );
};
