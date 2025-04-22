import { RecentOrders } from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './photon-prescribe-workflow';
import { onCleanup } from 'solid-js';

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

  onCleanup(() => {
    actions.reset();
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
        hidePatientCard={props.hidePatientCard}
        enableOrder={props.enableOrder}
        enableLocalPickup={props.enableLocalPickup}
        enableSendToPatient={props.enableSendToPatient}
        enableDeliveryPharmacies={props.enableDeliveryPharmacies}
        enableMedHistory={props.enableMedHistory}
        enableMedHistoryLinks={props.enableMedHistoryLinks}
        enableMedHistoryRefillButton={props.enableMedHistoryRefillButton}
        enableCombineAndDuplicate={props.enableCombineAndDuplicate}
        mailOrderIds={props.mailOrderIds}
        pharmacyId={props.pharmacyId}
        loading={props.loading}
        address={props.address}
        weight={props.weight}
        weightUnit={props.weightUnit}
        additionalNotes={props.additionalNotes}
        triggerSubmit={props.triggerSubmit}
        toastBuffer={props.toastBuffer}
        formStore={store}
        formActions={actions}
        externalOrderId={props.externalOrderId}
        catalogId={props.catalogId}
        allowOffCatalogSearch={props.allowOffCatalogSearch}
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
    hidePatientCard: false,
    enableOrder: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: true,
    enableCombineAndDuplicate: false,
    enableMedHistory: false,
    enableMedHistoryRefillButton: false,
    enableMedHistoryLinks: false,
    mailOrderIds: undefined,
    pharmacyId: undefined,
    loading: false,
    address: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    additionalNotes: undefined,
    triggerSubmit: false,
    setTriggerSubmit: undefined,
    toastBuffer: 0,
    externalOrderId: undefined,
    catalogId: undefined,
    allowOffCatalogSearch: true
  },
  Component
);
