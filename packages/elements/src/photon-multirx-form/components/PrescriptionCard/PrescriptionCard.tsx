import {
  Button,
  Card,
  ScreeningAlertType,
  usePharmacySelectionContext
} from '@photonhealth/components';
import { DraftPrescriptionCard } from './DraftPrescriptionCard';
import { createSignal, Show } from 'solid-js';
import { AddPrescriptionCard } from './AddPrescriptionCard';
import { DisableList } from '../PrescribeWorkflow';

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
  const pharmacySelectionContext = usePharmacySelectionContext();
  let prescriptionFormRef: HTMLDivElement | undefined;
  const [showForm, setShowForm] = createSignal<boolean>(false);

  return (
    <Card>
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
          class="w-full xs:w-fit mt-5"
          size="lg"
          onClick={() => setShowForm(true)}
        >
          + Add another
        </Button>
      </Show>
      <Show when={showForm()}>
        <div ref={prescriptionFormRef}>
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
    </Card>
  );
};
