import { createSignal, Ref } from 'solid-js';
import { DraftPrescriptions } from '@photonhealth/components';
import { Card, Text, usePrescribe } from '@photonhealth/components';
import repopulateForm from '../util/repopulateForm';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { PhotonTooltip } from '../../photon-tooltip';
import { partition } from 'lodash';
import { ScreeningAlertType } from '@photonhealth/components';

export const DraftPrescriptionCard = (props: {
  templateIds: string[];
  templateOverrides: any;
  prescriptionIds: string[];
  prescriptionRef: HTMLDivElement | undefined;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  setIsEditing: (isEditing: boolean) => void;
  handleDraftPrescriptionsChange: () => void;
  screeningAlerts: ScreeningAlertType[];
  enableOrder: boolean;
}) => {
  let ref: Ref<any> | undefined;
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = createSignal<boolean>(false);
  const [editDraft, setEditDraft] = createSignal<any>(undefined);
  const [deleteDraftId, setDeleteDraftId] = createSignal<string | undefined>();
  const prescribeContext = usePrescribe();
  if (!prescribeContext) {
    throw new Error('PrescribeWorkflow must be wrapped with PrescribeProvider');
  }
  const { prescriptionIds, setPrescriptionIds } = prescribeContext;

  const dispatchPrescriptionDraftDeleted = (id: string) => {
    const event = new CustomEvent('photon-draft-prescription-deleted', {
      composed: true,
      bubbles: true,
      detail: {
        prescriptionId: id
      }
    });
    ref?.dispatchEvent(event);
  };

  const editPrescription = () => {
    if (editDraft().treatment) {
      repopulateForm(props.actions, editDraft());

      props.actions.updateFormValue({
        key: 'catalogId',
        value: editDraft().catalogId
      });

      // remove the draft from the list
      props.actions.updateFormValue({
        key: 'draftPrescriptions',
        value: props.store['draftPrescriptions'].value.filter((x: any) => x.id !== editDraft().id)
      });

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

  const checkEditPrescription = (id: string) => {
    const draft = props.store['draftPrescriptions'].value.find((x: any) => x.id === id);
    setEditDraft(draft);

    if (!props.store['treatment'].value) {
      props.setIsEditing(true);
      editPrescription();
    } else {
      setEditDialogOpen(true);
    }
  };

  const handleEditConfirm = () => {
    editPrescription();
    setEditDialogOpen(false);
    setEditDraft(undefined);
  };
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditDraft(undefined);
  };
  const handleDeleteConfirm = () => {
    const [deleted, remaining] = partition(prescriptionIds(), (x) => x === deleteDraftId());

    setPrescriptionIds(remaining);
    dispatchPrescriptionDraftDeleted(deleted[0]);

    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);

    if (props.store['draftPrescriptions']?.value?.length === 0) {
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
        <DraftPrescriptions
          prescriptionIds={prescriptionIds()}
          handleDelete={(draftId: string) => {
            setDeleteDialogOpen(true);
            setDeleteDraftId(draftId);
          }}
          handleEdit={(draftId: string) => {
            checkEditPrescription(draftId);
          }}
          screeningAlerts={props.screeningAlerts}
          enableOrder={props.enableOrder}
        />
      </Card>
    </div>
  );
};
