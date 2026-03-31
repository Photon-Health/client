import { createSignal } from 'solid-js';
import {
  Card,
  CoverageOption,
  DraftPrescriptionList,
  PrescriptionFormData,
  RoutingConstraint,
  ScreeningAlertType,
  Text,
  useDraftPrescriptions,
  usePrescribe,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import repopulateForm from '../util/repopulateForm';
import { PhotonTooltip } from '../../photon-tooltip';

export const DraftPrescriptionCard = (props: {
  prescriptionRef: HTMLDivElement | undefined;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  setIsEditing: (isEditing: boolean) => void;
  handleDraftPrescriptionsChange: () => void;
  screeningAlerts: ScreeningAlertType[];
  routingConstraints: RoutingConstraint[];
  enableOrder: boolean;
}) => {
  const { dispatchDraftPrescriptionDeleted, dispatchCtaAnalyticsEvent } =
    usePrescribeEventDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = createSignal<boolean>(false);
  const [editDialogConfirm, setEditDialogConfirm] = createSignal<(() => void) | undefined>();
  const [editDraft, setEditDraft] = createSignal<PrescriptionFormData | undefined>(undefined);
  const [deleteDraftId, setDeleteDraftId] = createSignal<string | undefined>();
  const { selectOtherCoverageOption } = usePrescribe();
  const { draftPrescriptions, prescriptionIds, deletePrescription } = useDraftPrescriptions();

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

      props.prescriptionRef?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      props.handleDraftPrescriptionsChange();
    }
  };

  const checkEditPrescription = (draft: PrescriptionFormData, onConfirm?: () => undefined) => {
    setEditDraft(draft);

    if (!props.store['treatment'].value) {
      props.setIsEditing(true);
      editPrescription();
      onConfirm?.();
      dispatchDraftPrescriptionDeleted();
      dispatchCtaAnalyticsEvent({ name: 'Minor CTA Clicked', ctaName: 'edit draft' });
    } else {
      setEditDialogOpen(true);
      setEditDialogConfirm(onConfirm);
    }
  };

  const handleSwapToOtherPrescription = (coverage: CoverageOption) => {
    checkEditPrescription(toFormData(coverage), () => {
      selectOtherCoverageOption(coverage);
    });
  };

  const handleEditConfirm = () => {
    editPrescription();
    setEditDialogOpen(false);
    setEditDraft(undefined);

    editDialogConfirm()?.();
    setEditDialogConfirm(undefined);
    dispatchDraftPrescriptionDeleted();
    dispatchCtaAnalyticsEvent({ name: 'Minor CTA Clicked', ctaName: 'edit draft' });
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
      dispatchCtaAnalyticsEvent({ name: 'Minor CTA Clicked', ctaName: 'delete draft' });
    }

    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);

    if (prescriptionIds().length === 0) {
      // reopen form if all drafts are deleted
      props.setIsEditing(true);
    }

    props.handleDraftPrescriptionsChange();
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);
  };

  return (
    <div>
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
      <Card addChildrenDivider={true}>
        <div class="flex items-center space-x-2 text-slate-500">
          <Text color="gray" class="pr-2">
            Draft Prescriptions
          </Text>
          <PhotonTooltip
            maxWidth="300px"
            tip="Each prescription will include the prescriber’s digital signature and the date it was written when the order is sent to the pharmacy."
          />
        </div>
        <DraftPrescriptionList
          handleDelete={(draftId: string) => {
            setDeleteDialogOpen(true);
            setDeleteDraftId(draftId);
          }}
          handleEdit={(draft) => {
            checkEditPrescription(draft);
          }}
          handleSwapToOtherPrescription={handleSwapToOtherPrescription}
          screeningAlerts={props.screeningAlerts}
          routingConstraints={props.routingConstraints}
          enableOrder={props.enableOrder}
        />
      </Card>
    </div>
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
