import { createSignal, Ref } from 'solid-js';
import {
  Card,
  DraftPrescriptionList,
  PrescriptionFormData,
  ScreeningAlertType,
  RoutingConstraint,
  Text,
  useDraftPrescriptions,
  usePrescribe
} from '@photonhealth/components';
import repopulateForm from '../util/repopulateForm';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { PhotonTooltip } from '../../photon-tooltip';
import { Prescription } from '@photonhealth/sdk/dist/types';

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
  let ref: Ref<any> | undefined;
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = createSignal<boolean>(false);
  const [editDialogConfirm, setEditDialogConfirm] = createSignal<(() => void) | undefined>();
  const [editDraft, setEditDraft] = createSignal<PrescriptionFormData | undefined>(undefined);
  const [deleteDraftId, setDeleteDraftId] = createSignal<string | undefined>();
  const { prescriptionIds, deletePrescription, setDidSelectOtherCoverageOption } = usePrescribe();
  const { draftPrescriptions } = useDraftPrescriptions();

  const dispatchPrescriptionDraftDeleted = (prescription?: Prescription) => {
    const event = new CustomEvent('photon-draft-prescription-deleted', {
      composed: true,
      bubbles: true,
      detail: {
        prescription
      }
    });
    ref?.dispatchEvent(event);
  };

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

      window.scrollTo({
        behavior: 'smooth',
        top:
          (props.prescriptionRef?.getBoundingClientRect().top || 0) -
          document.body.getBoundingClientRect().top -
          70
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
    } else {
      setEditDialogOpen(true);
      setEditDialogConfirm(onConfirm);
    }
  };

  const handleSwapToOtherPrescription = (otherOptionDraftRx: PrescriptionFormData) => {
    checkEditPrescription(otherOptionDraftRx, () => {
      // setting this to throttle further calls to generateCoverageOptions after a swap is made
      setDidSelectOtherCoverageOption(true);
    });
  };

  const handleEditConfirm = () => {
    editPrescription();
    setEditDialogOpen(false);
    setEditDraft(undefined);

    editDialogConfirm()?.();
    setEditDialogConfirm(undefined);
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
      dispatchPrescriptionDraftDeleted(deletedRx);
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
    <div ref={ref}>
      <style>{photonStyles}</style>
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
            {props.enableOrder ? 'Pending Order' : 'Pending Prescriptions'}
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
