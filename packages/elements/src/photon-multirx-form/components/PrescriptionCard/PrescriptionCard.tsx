import {
  Button,
  Card,
  ScreeningAlertType,
  Spinner,
  Text,
  useDraftPrescriptions,
  usePharmacySelectionContext
} from '@photonhealth/components';
import { DraftPrescriptionCard } from './DraftPrescriptionCard';
import { createEffect, createSignal, Show } from 'solid-js';
import { AddPrescriptionCard } from './AddPrescriptionCard';
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
  const pharmacySelectionContext = usePharmacySelectionContext();
  const { prescriptionIds, isLoadingPrefills } = useDraftPrescriptions();
  const [showForm, setShowForm] = createSignal<boolean>(false);

  createEffect(() => {
    if (prescriptionIds().length === 0) {
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
          <Spinner color="green" />
        </Show>
        <Show when={!isLoadingPrefills()}>
          <DraftPrescriptionCard
            prescriptionFormRef={prescriptionFormRef}
            actions={props.actions}
            store={props.store}
            setShowForm={() => setShowForm(true)}
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
              <AddPrescriptionCard
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
                hideForm={() => setShowForm(false)}
              />
            </div>
          </Show>
        </Show>
      </div>
    </Card>
  );
};
