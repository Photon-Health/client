import {
  DraftPrescriptionsProvider,
  PharmacySelectionProvider,
  PrescribeEventDispatchProvider,
  PrescribeProvider,
  PrescriptionScreeningProvider,
  RecentOrders,
  SupervisorPrefill,
  SupervisorProvider,
  TemplateOverrides
} from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './components/PrescribeWorkflow';
import { onCleanup } from 'solid-js';
import { PatientStore } from '../stores/patient';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

export interface PrescribeWorkflowComponentProps extends PrescribeProps {
  templateIds?: string;
  templateOverrides?: TemplateOverrides;
  prescriptionIds?: string;
  enableCoverageCheck: boolean;
  pharmacyId?: string;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableDeliveryPharmacies: boolean;
  mailOrderIds?: string;
  supervisor?: SupervisorPrefill;
}

export const PhotonPrescribeWorkflowComponent = (props: PrescribeWorkflowComponentProps) => {
  const { actions: patientActions } = PatientStore;
  const { store, actions } = createFormStore({
    dispenseAsWritten: false,
    patient: undefined,
    treatment: undefined,
    pharmacy: undefined,
    errors: [],
    address: undefined,
    supervisorId: undefined
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
          additionalNotes={props.additionalNotes}
          weight={props.weight}
          weightUnit={props.weightUnit}
        >
          <PharmacySelectionProvider
            pharmacyIdProp={props.pharmacyId}
            enableLocalPickup={props.enableLocalPickup}
            enableSendToPatient={props.enableSendToPatient}
            enableDeliveryPharmacies={props.enableDeliveryPharmacies}
            mailOrderIds={props.mailOrderIds}
            onFulfillmentTypeChange={(ft) => {
              actions.updateFormValue({ key: 'fulfillmentType', value: ft || '' });
            }}
            onPreferredPharmacyChange={(shouldSet) => {
              actions.updateFormValue({ key: 'updatePreferredPharmacy', value: shouldSet });
            }}
          >
            <PrescribeProvider
              patientId={store.patient?.value?.id}
              enableCoverageCheck={props.enableCoverageCheck}
            >
              <PrescriptionScreeningProvider>
                <SupervisorProvider supervisor={props.supervisor}>
                  <style>{tailwind}</style>
                  <style>{shoelaceDarkStyles}</style>
                  <style>{shoelaceLightStyles}</style>
                  <style>{styles}</style>
                  <PrescribeWorkflow
                    patientId={props.patientId}
                    hideSubmit={props.hideSubmit}
                    hideTemplates={props.hideTemplates}
                    hidePatientCard={props.hidePatientCard}
                    enableOrder={props.enableOrder}
                    enableMedHistory={props.enableMedHistory}
                    enableMedHistoryLinks={props.enableMedHistoryLinks}
                    enableMedHistoryRefillButton={props.enableMedHistoryRefillButton}
                    enableCombineAndDuplicate={props.enableCombineAndDuplicate}
                    optionalPatientAddress={props.optionalPatientAddress}
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
                  />
                </SupervisorProvider>
              </PrescriptionScreeningProvider>
            </PrescribeProvider>
          </PharmacySelectionProvider>
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
    groupId: undefined,
    supervisor: undefined
  },
  PhotonPrescribeWorkflowComponent
);
