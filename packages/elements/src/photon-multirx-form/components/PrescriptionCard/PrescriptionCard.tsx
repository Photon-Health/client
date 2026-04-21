import {
  Button,
  Card,
  ScreeningAlertType,
  Spinner,
  Text,
  useDraftPrescriptions,
  usePharmacySelectionContext
} from '@photonhealth/components';
import { DraftPrescriptions } from './DraftPrescriptions';
import { createEffect, createSignal, Show, untrack } from 'solid-js';
import { DraftPrescriptionForm } from './DraftPrescriptionForm';
import { DisableList } from '../PrescribeWorkflow';
import { PhotonTooltip } from '../../../photon-tooltip';

export const PrescriptionCard = (props: {
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  hideAddToTemplates: boolean;
  weight?: number;
  weightUnit?: string;
  prefillNotes?: string;
  screenDraftedPrescriptions: () => void;
  screeningAlerts: ScreeningAlertType[];
  enableOrder: boolean;
  catalogId?: string;
  allowOffCatalogSearch?: boolean;
  disableList?: DisableList;
}) => {
  let prescriptionFormRef: HTMLDivElement | undefined;
  let lastDraftRef: HTMLDivElement | undefined;
  const pharmacySelectionContext = usePharmacySelectionContext();
  const { draftPrescriptions, isLoadingPrefills } = useDraftPrescriptions();
  const [showForm, setShowForm] = createSignal<boolean>(false);

  createEffect(() => {
    // When prefills are done loading, decide if form should be hidden
    if (!isLoadingPrefills()) {
      // Don't need to track draftPrescriptions after isLoadingPrefills
      // switches to false
      untrack(() => {
        // If prefills were successfully created,
        // most providers won't add another draft so hide form
        if (draftPrescriptions().length !== 0) {
          setShowForm(false);
        }
      });
    }
  });

  createEffect(() => {
    if (draftPrescriptions().length === 0) {
      // reopen form if all drafts are deleted
      setShowForm(true);
    }
  });

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center space-x-2 text-slate-500">
        <Text color="gray" class="pr-2">
          Prescriptions
        </Text>
        <PhotonTooltip
          maxWidth="300px"
          tip="Each prescription will include the prescriber's digital signature and the date it was written when the order is sent to the pharmacy."
        />
      </div>
      <div>
        <Show when={isLoadingPrefills()}>
          <div class="w-full flex justify-center">
            <Spinner color="green" />
          </div>
        </Show>
        <Show when={!isLoadingPrefills()}>
          <DraftPrescriptions
            prescriptionFormRef={prescriptionFormRef}
            ref={lastDraftRef}
            actions={props.actions}
            store={props.store}
            expandForm={() => setShowForm(true)}
            handleDraftPrescriptionsChange={props.screenDraftedPrescriptions}
            screeningAlerts={props.screeningAlerts}
            routingConstraints={pharmacySelectionContext.routingConstraints()}
            enableOrder={props.enableOrder}
          />
          <Show when={!showForm()}>
            <Button
              variant="secondary"
              class="w-full xs:w-fit mt-4"
              size="lg"
              onClick={() => setShowForm(true)}
            >
              + Add another
            </Button>
          </Show>
          <Show when={showForm()}>
            <div ref={prescriptionFormRef} class="mt-8">
              <DraftPrescriptionForm
                hideAddToTemplates={props.hideAddToTemplates}
                actions={props.actions}
                store={props.store}
                weight={props.weight}
                weightUnit={props.weightUnit}
                prefillNotes={props.prefillNotes}
                screenDraftedPrescriptions={props.screenDraftedPrescriptions}
                screeningAlerts={props.screeningAlerts}
                catalogId={props.catalogId}
                allowOffCatalogSearch={props.allowOffCatalogSearch}
                disableList={props.disableList}
                onHideForm={() => {
                  setShowForm(false);
                  lastDraftRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            </div>
          </Show>
        </Show>
      </div>
    </Card>
  );
};
