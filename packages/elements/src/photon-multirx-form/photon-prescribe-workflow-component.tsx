import {
  DraftPrescriptionsProvider,
  PrescribeEventDispatchProvider,
  PrescribeProvider,
  RecentOrders,
  TemplateOverrides
} from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './components/PrescribeWorkflow';
import { onCleanup } from 'solid-js';
import { PatientStore } from '../stores/patient';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import photonStyles from '@photonhealth/components/dist/index.css?inline';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

interface PrescribeWorkflowComponentProps extends Omit<PrescribeProps, 'initialShowForm'> {
  templateIds?: string;
  templateOverrides?: TemplateOverrides;
  prescriptionIds?: string;
  enableCoverageCheck: boolean;
}

const Component = (props: PrescribeWorkflowComponentProps) => {
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
    <PrescribeEventDispatchProvider>
      <RecentOrders patientId={store.patient?.value?.id}>
        <DraftPrescriptionsProvider
          patientId={store.patient?.value?.id}
          templateIdsPrefill={props.templateIds?.split(',').map((id) => id.trim()) || []}
          templateOverrides={props.templateOverrides || {}}
          prescriptionIdsPrefill={props.prescriptionIds?.split(',').map((id) => id.trim()) || []}
          enableCombineAndDuplicate={props.enableCombineAndDuplicate}
        >
          <PrescribeProvider
            patientId={store.patient?.value?.id}
            enableCoverageCheck={props.enableCoverageCheck}
          >
            <style>{tailwind}</style>
            <style>{shoelaceDarkStyles}</style>
            <style>{shoelaceLightStyles}</style>
            <style>{styles}</style>
            <style>{photonStyles}</style>
            <PrescribeWorkflow
              patientId={props.patientId}
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
              optionalPatientAddress={props.optionalPatientAddress}
              mailOrderIds={props.mailOrderIds}
              pharmacyId={props.pharmacyId}
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
              disableList={props.disableList}
              groupId={props.groupId}
              // this logic keeps the rx form closed when refilling a particular template/prescription
              initialShowForm={!props.templateIds && !props.prescriptionIds}
            />
          </PrescribeProvider>
        </DraftPrescriptionsProvider>
      </RecentOrders>
    </PrescribeEventDispatchProvider>
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
    optionalPatientAddress: false,
    mailOrderIds: undefined,
    pharmacyId: undefined,
    address: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    additionalNotes: undefined,
    triggerSubmit: false,
    toastBuffer: 0,
    externalOrderId: undefined,
    catalogId: undefined,
    allowOffCatalogSearch: true,
    enableCoverageCheck: false,
    disableList: undefined,
    groupId: undefined
  },
  Component
);
