import { createSignal } from 'solid-js';
import {
  CoverageOption,
  DraftPrescriptionList,
  PrescriptionFormData,
  RoutingConstraint,
  ScreeningAlertType,
  useDraftPrescriptions,
  usePrescribe,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import repopulateForm from './util/repopulateForm';

export const DraftPrescriptions = (props: {
  prescriptionFormRef: HTMLDivElement | undefined;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  setShowForm: () => void;
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
  const { selectOtherCoverageOption } = usePrescribe();
  const { draftPrescriptions, deletePrescription } = useDraftPrescriptions();

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
      props.setShowForm();
      editPrescription();
      onConfirm?.();
      dispatchDraftPrescriptionDeleted();
      dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Draft Prescription Edited' });
    } else {
      setEditDialogOpen(true);
      setEditDialogConfirm(onConfirm);
    }
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

  return (
    <>
      <DraftPrescriptionList
        handleDelete={(draftId: string) => {
          setDeleteDialogOpen(true);
          setDeleteDraftId(draftId);
        }}
        handleEdit={(draft) => {
          checkCanEditPrescription(draft);
        }}
        handleSwapToOtherPrescription={(coverage: CoverageOption) => {
          checkCanEditPrescription(toFormData(coverage), () => {
            selectOtherCoverageOption(coverage);
          });
        }}
        screeningAlerts={props.screeningAlerts}
        routingConstraints={props.routingConstraints}
        enableOrder={props.enableOrder}
      />
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
