import {
  DraftPrescriptionsProvider,
  PrescribeProvider,
  RecentOrders
} from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './photon-prescribe-workflow';
import { onCleanup } from 'solid-js';
import { PatientStore } from '../stores/patient';

const Component = (props: PrescribeProps) => {
  const { actions: patientActions } = PatientStore;
  const { store, actions } = createFormStore({
    dispenseAsWritten: false,
    patient: undefined,
    treatment: undefined,
    pharmacy: undefined,
    errors: [],
    address: undefined
  });

  onCleanup(() => {
    patientActions.clearSelectedPatient();
    actions.reset();
  });

  return (
    <DraftPrescriptionsProvider>
      <RecentOrders patientId={store.patient?.value?.id}>
        <PrescribeProvider
          templateIdsPrefill={props.templateIds?.split(',').map((id) => id.trim()) || []}
          templateOverrides={props.templateOverrides || {}}
          prescriptionIdsPrefill={props.prescriptionIds?.split(',').map((id) => id.trim()) || []}
          patientId={store.patient?.value?.id}
          enableCombineAndDuplicate={props.enableCombineAndDuplicate}
          enableCoverageCheck={props.enableCoverageCheck}
        >
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
            enableCoverageCheck={props.enableCoverageCheck}
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
        </PrescribeProvider>
      </RecentOrders>
    </DraftPrescriptionsProvider>
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
    allowOffCatalogSearch: true,
    enableCoverageCheck: false
  },
  Component
);
