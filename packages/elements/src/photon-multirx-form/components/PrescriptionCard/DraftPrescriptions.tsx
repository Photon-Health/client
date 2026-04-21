import { createMemo, createSignal, For, Show } from 'solid-js';
import {
  Banner,
  CoverageOption,
  DraftPrescriptionItem,
  DraftPrescriptionLayout,
  isValidPrescriptionRoutingConstraint,
  PrescriptionFormData,
  RoutingConstraint,
  ScreeningAlertType,
  Text,
  useDraftPrescriptions,
  usePrescribe,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import repopulateForm from './util/repopulateForm';

export function getPrescriptionRoutingConstraints(
  routingConstraints: RoutingConstraint[]
): Map<string, RoutingConstraint> {
  const map = new Map<string, RoutingConstraint>();
  for (const constraint of routingConstraints) {
    if (isValidPrescriptionRoutingConstraint(constraint)) {
      map.set(constraint.prescriptions[0].id, constraint);
    }
  }
  return map;
}

export const DraftPrescriptions = (props: {
  prescriptionFormRef: HTMLDivElement | undefined;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  expandForm: () => void;
  handleDraftPrescriptionsChange: () => void;
  screeningAlerts: ScreeningAlertType[];
  routingConstraints: RoutingConstraint[];
  enableOrder: boolean;
}) => {
  const { dispatchDraftPrescriptionDeleted, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();
  const [editDialogOpen, setEditDialogOpen] = createSignal<boolean>(false);
  const [editDialogConfirm, setEditDialogConfirm] = createSignal<(() => void) | undefined>();
  const [editDraft, setEditDraft] = createSignal<PrescriptionFormData | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal<boolean>(false);
  const [deleteDraftId, setDeleteDraftId] = createSignal<string | undefined>();
  const { selectOtherCoverageOption, coverageOptions } = usePrescribe();
  const { draftPrescriptions, deletePrescription, isLoadingPrefills, prescriptionIds } =
    useDraftPrescriptions();
  const prescriptionRoutingConstraints = createMemo((): Map<string, RoutingConstraint> => {
    return getPrescriptionRoutingConstraints(props.routingConstraints);
  });

  const editPrescription = () => {
    const formData = editDraft();
    if (formData && formData.treatment) {
      repopulateForm(props.actions, formData);

      props.actions.updateFormValue({
        key: 'catalogId',
        value: formData.catalogId
      });

      if (formData.id) {
        deletePrescription(formData.id);
      }

      props.prescriptionFormRef?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      props.handleDraftPrescriptionsChange();
    }
  };

  const checkCanEditPrescription = (draft: PrescriptionFormData, onConfirm?: () => undefined) => {
    setEditDraft(draft);

    if (!props.store['treatment'].value) {
      props.expandForm();
      editPrescription();
      onConfirm?.();
      dispatchDraftPrescriptionDeleted();
      dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Draft Prescription Edited' });
    } else {
      setEditDialogOpen(true);
      setEditDialogConfirm(onConfirm);
    }
  };

  const handleEdit = (draft: PrescriptionFormData) => {
    checkCanEditPrescription(draft);
  };
  const handleEditConfirm = () => {
    editPrescription();
    setEditDialogOpen(false);
    setEditDraft(undefined);

    editDialogConfirm()?.();
    setEditDialogConfirm(undefined);
    dispatchDraftPrescriptionDeleted();
    dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Draft Prescription Edited' });
  };
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditDraft(undefined);
    setEditDialogConfirm(undefined);
  };

  const handleDelete = (draftId: string) => {
    setDeleteDialogOpen(true);
    setDeleteDraftId(draftId);
  };
  const handleDeleteConfirm = () => {
    const deletedId = deleteDraftId();
    if (deletedId) {
      const deletedRx = draftPrescriptions().find((rx) => rx.id === deletedId);
      deletePrescription(deletedId);
      dispatchDraftPrescriptionDeleted(deletedRx);
      dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Draft Prescription Deleted' });
    }

    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);

    props.handleDraftPrescriptionsChange();
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);
  };

  const handleSwapToOtherPrescription = (coverage: CoverageOption) => {
    checkCanEditPrescription(toFormData(coverage), () => {
      selectOtherCoverageOption(coverage);
    });
  };

  return (
    <>
      <div class="space-y-3">
        <Show when={isLoadingPrefills()}>
          <For each={prescriptionIds()}>
            {() => (
              <DraftPrescriptionLayout
                LeftChildren={
                  <>
                    <Text size="lg" sampleLoadingText="Medication 100mg" loading />
                    <Text
                      size="sm"
                      sampleLoadingText="Loading notes about the medication"
                      loading
                    />
                  </>
                }
              />
            )}
          </For>
        </Show>

        {/* Show when No Drafts */}
        <Show when={!isLoadingPrefills() && draftPrescriptions().length === 0}>
          <Banner status="info">
            {props.enableOrder
              ? 'Add prescription(s) before sending'
              : 'Add prescription(s) before saving'}
          </Banner>
        </Show>

        {/* Show when Drafts */}
        <Show when={!isLoadingPrefills() && draftPrescriptions().length > 0}>
          <div class="flex flex-col gap-4">
            <For each={draftPrescriptions()}>
              {(draftPrescription) => (
                <DraftPrescriptionItem
                  screeningAlerts={props.screeningAlerts}
                  routingConstraint={prescriptionRoutingConstraints().get(draftPrescription.id)}
                  draft={draftPrescription}
                  coverageOptions={coverageOptions().filter(
                    (c) => c.prescriptionId === draftPrescription.id
                  )}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleSwapToOtherPrescription={handleSwapToOtherPrescription}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
      <photon-dialog
        open={editDialogOpen()}
        label="Overwrite in progress prescription?"
        confirm-text="Yes, Overwrite"
        cancel-text="No, Cancel"
        on:photon-dialog-confirmed={handleEditConfirm}
        on:photon-dialog-canceled={handleEditCancel}
        on:photon-dialog-alt={handleEditCancel}
      >
        <p class="font-sans text-lg xs:text-base">
          You are editing a prescription that has not been added. This will be overwritten if you
          edit another prescription.
        </p>
      </photon-dialog>
      <photon-dialog
        open={deleteDialogOpen()}
        label="Delete pending prescription?"
        confirm-text="Yes, Delete"
        cancel-text="No, Cancel"
        on:photon-dialog-confirmed={handleDeleteConfirm}
        on:photon-dialog-canceled={handleDeleteCancel}
        on:photon-dialog-alt={handleDeleteCancel}
      >
        <p class="font-sans text-lg xs:text-base">
          Deleting this prescription will remove it from your pending prescriptions. This action
          cannot be undone.
        </p>
      </photon-dialog>
    </>
  );
};

// this should probably live in PrescribeProvider
// but it'll be easier to migrate it there after we migrate the Edit Prescription
// flow there
function toFormData(coverageOption: CoverageOption): PrescriptionFormData {
  return {
    // re-using the prescriptionId (via coverageOption.prescriptionId) of the original Prescription
    // so that the edit flow will remove it from the list of prescriptions
    id: coverageOption.prescriptionId,
    doNotFillBeforeDate: undefined,
    dispenseAsWritten: false,
    dispenseQuantity: coverageOption.dispenseQuantity,
    dispenseUnit: coverageOption.dispenseUnit,
    daysSupply: coverageOption.daysSupply,
    instructions: '',
    notes: '',
    fillsAllowed: undefined,
    diagnoseCodes: [],
    externalId: undefined,
    catalogId: undefined,
    treatment: {
      id: coverageOption.treatment.id,
      name: coverageOption.treatment.name
    }
  };
}
