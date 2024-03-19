import { RecentOrders } from '@photonhealth/components';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './photon-prescribe-workflow';
import { customElement } from 'solid-element';

const Component = (props: PrescribeProps) => {
  const { store, actions } = createFormStore({
    dispenseAsWritten: false,
    patient: undefined,
    treatment: undefined,
    draftPrescriptions: [],
    pharmacy: undefined,
    errors: [],
    address: undefined
  });

  return (
    <RecentOrders patientId={store.patient?.value?.id}>
      <PrescribeWorkflow
        patientId={props.patientId}
        templateIds={props.templateIds}
        templateOverrides={props.templateOverrides}
        prescriptionIds={props.prescriptionIds}
        hideSubmit={props.hideSubmit}
        hideTemplates={props.hideTemplates}
        enableOrder={props.enableOrder}
        enableLocalPickup={props.enableLocalPickup}
        enableSendToPatient={props.enableSendToPatient}
        enableMedHistory={props.enableMedHistory}
        enableCombineAndDuplicate={props.enableCombineAndDuplicate}
        mailOrderIds={props.mailOrderIds}
        pharmacyId={props.pharmacyId}
        loading={props.loading}
        address={props.address}
        weight={props.weight}
        weightUnit={props.weightUnit}
        triggerSubmit={props.triggerSubmit}
        toastBuffer={props.toastBuffer}
        formStore={store}
        formActions={actions}
        externalOrderId={props.externalOrderId}
      />
    </RecentOrders>
  );
};
customElement(
  'photon-prescribe-workflow',
  {
    patientId: undefined,
    templateIds: undefined,
    templateOverrides: undefined,
    prescriptionIds: undefined,
    hideSubmit: false,
    hideTemplates: false,
    enableOrder: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableCombineAndDuplicate: false,
    enableMedHistory: false,
    mailOrderIds: undefined,
    pharmacyId: undefined,
    loading: false,
    address: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    triggerSubmit: false,
    setTriggerSubmit: undefined,
    toastBuffer: 0,
    externalOrderId: undefined
  },
  Component
);
