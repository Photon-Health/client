import {
  DiagnosisCodesPrefill,
  DraftPrescriptionsProvider,
  InitialPrescriptionsPrefill,
  PharmacySelectionProvider,
  PrescribeEventDispatchProvider,
  PrescribeProvider,
  PrescriptionOverrides,
  PrescriptionScreeningProvider,
  RecentOrders,
  SupervisorPrefill,
  SupervisorProvider,
  TemplateOverrides,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import type { ElementViewEvent } from '@photonhealth/sdk';
import { customElement } from 'solid-element';
import { createFormStore } from '../stores/form';
import { PrescribeProps, PrescribeWorkflow } from './components/PrescribeWorkflow';
import { onCleanup, onMount } from 'solid-js';
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

type PrescribeWorkflowViewedEvent = Extract<
  ElementViewEvent,
  { name: 'Prescribe Workflow Viewed' }
>;

const parseIdList = (ids?: string) =>
  ids
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean) ?? [];

const buildPrescribeWorkflowViewedEvent = (
  props: PrescribeWorkflowComponentProps
): PrescribeWorkflowViewedEvent => {
  // Prefill HTML attributes attempt to parse JSON strings.
  // If the attribute remains a string, the value couldn't be JSON parsed.
  const validatePrefill = <T,>(prefill?: T | string): T | undefined => {
    return prefill && typeof prefill !== 'string' ? prefill : undefined;
  };

  return {
    name: 'Prescribe Workflow Viewed',
    patientId: props.patientId,
    catalogId: props.catalogId,
    groupId: props.groupId,
    mailOrderIds: props.mailOrderIds,
    pharmacyId: props.pharmacyId,
    hasExternalOrderId: Boolean(props.externalOrderId),
    hasDisableList: Boolean(props.disableList),
    disableList:
      validatePrefill(props.disableList)
        ?.map((item) => item.treatmentIds)
        .filter((ids) => !!ids)
        .flat() || undefined,
    hideSubmit: props.hideSubmit,
    hideTemplates: props.hideTemplates,
    hidePatientCard: props.hidePatientCard,
    enableOrder: props.enableOrder,
    enableMedHistory: props.enableMedHistory,
    enableMedHistoryLinks: props.enableMedHistoryLinks,
    enableMedHistoryRefillButton: props.enableMedHistoryRefillButton,
    enableCombineAndDuplicate: props.enableCombineAndDuplicate,
    enableCoverageCheck: props.enableCoverageCheck,
    enableLocalPickup: props.enableLocalPickup,
    enableSendToPatient: props.enableSendToPatient,
    enableDeliveryPharmacies: props.enableDeliveryPharmacies,
    optionalPatientAddress: props.optionalPatientAddress,
    allowOffCatalogSearch: props.allowOffCatalogSearch,
    triggerSubmit: props.triggerSubmit,
    toastBuffer: props.toastBuffer,
    hasTemplateIdsPrefill: Boolean(props.templateIds),
    numTemplateIds: parseIdList(props.templateIds).length,
    hasTemplateOverridesPrefill: Boolean(props.templateOverrides),
    hasPrescriptionIdsPrefill: Boolean(props.prescriptionIds),
    numPrescriptionIds: parseIdList(props.prescriptionIds).length,
    hasPrescriptionOverridesPrefill: Boolean(props.prescriptionOverrides),
    hasInitialPrescriptionsPrefill: Boolean(props.initialPrescriptions),
    numInitialPrescriptions: validatePrefill(props.initialPrescriptions)?.length || 0,
    hasSupervisorPrefill: Boolean(props.supervisor),
    hasDiagnosisCodesPrefill: Boolean(props.diagnosisCodes),
    hasAddressPrefill: Boolean(props.address),
    additionalNotesLength: props.additionalNotes?.length || 0,
    hasWeight: props.weight !== undefined && props.weight !== null,
    hasWeightUnit: Boolean(props.weightUnit)
  };
};

// Rendered inside PrescribeEventDispatchProvider so the mount event can be
// dispatched from the event dispatch ref
const PrescribeWorkflowViewed = (props: { workflowProps: PrescribeWorkflowComponentProps }) => {
  const { dispatchAnalyticsTrackEvent } = usePrescribeEventDispatch();

  onMount(() => {
    dispatchAnalyticsTrackEvent(
      'elementViewed',
      buildPrescribeWorkflowViewedEvent(props.workflowProps)
    );
  });

  return null;
};

export interface PrescribeWorkflowComponentProps extends PrescribeProps {
  templateIds?: string;
  templateOverrides?: TemplateOverrides;
  prescriptionIds?: string;
  prescriptionOverrides?: PrescriptionOverrides;
  initialPrescriptions?: InitialPrescriptionsPrefill;
  enableCoverageCheck: boolean;
  pharmacyId?: string;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableDeliveryPharmacies: boolean;
  mailOrderIds?: string;
  supervisor?: SupervisorPrefill;
  diagnosisCodes?: DiagnosisCodesPrefill;
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
      <PrescribeWorkflowViewed workflowProps={props} />
      <RecentOrders patientId={store.patient?.value?.id}>
        <DraftPrescriptionsProvider
          patientId={store.patient?.value?.id}
          templateIds={parseIdList(props.templateIds)}
          templateOverrides={props.templateOverrides || {}}
          prescriptionIds={parseIdList(props.prescriptionIds)}
          prescriptionOverrides={props.prescriptionOverrides || {}}
          initialPrescriptions={props.initialPrescriptions}
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
              <PrescriptionScreeningProvider
                formStore={store}
                diagnosisCodes={props.diagnosisCodes}
              >
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
    prescriptionOverrides: undefined,
    initialPrescriptions: undefined,
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
    supervisor: undefined,
    diagnosisCodes: undefined
  },
  PhotonPrescribeWorkflowComponent
);
