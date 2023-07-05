import { createSignal, For, Show } from 'solid-js';
import { message } from '../../validators';
import { size, array, any } from 'superstruct';
import repopulateForm from '../util/repopulateForm';

const draftPrescriptionsValidator = message(
  size(array(any()), 1, Infinity),
  'You must add at least 1 Prescription'
);

export const DraftPrescriptionCard = (props: {
  prescriptionRef: HTMLDivElement | undefined;
  actions: Record<string, (...args: any) => any>;
  store: Record<string, any>;
  isLoading: boolean;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = createSignal<boolean>(false);
  const [editDraft, setEditDraft] = createSignal<any>(undefined);
  const [deleteDraftId, setDeleteDraftId] = createSignal<string | undefined>();

  props.actions.registerValidator({
    key: 'draftPrescriptions',
    validator: draftPrescriptionsValidator
  });

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
    props.actions.updateFormValue({
      key: 'draftPrescriptions',
      value: props.store['draftPrescriptions'].value.filter((x: any) => x.id !== deleteDraftId())
    });
    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteDraftId(undefined);
  };

  return (
    <photon-card>
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
      <div class="flex flex-col gap-3">
        <p class="font-sans text-l font-medium">Pending Prescriptions</p>
        <Show
          when={(props.store['draftPrescriptions']?.value ?? []).length === 0 && !props.isLoading}
        >
          <div>
            <photon-card invalid={props.store['draftPrescriptions']?.error}>
              <p class="italic font-sans text-gray-500">No prescriptions pending</p>
            </photon-card>
            <Show when={props.store['draftPrescriptions']?.error}>
              <p class="font-sans text-red-500 text-sm pt-1.5">
                {props.store['draftPrescriptions']?.error}
              </p>
            </Show>
          </div>
        </Show>
        <Show when={props.isLoading}>
          <div>
            <photon-card>
              <div class="w-full flex justify-between">
                <p class="italic font-sans text-gray-500">Loading Prescriptions...</p>
                <sl-spinner style={{ 'font-size': '1rem' }} />
              </div>
            </photon-card>
          </div>
        </Show>
        <For each={props.store['draftPrescriptions']?.value ?? []}>
          {(draft: any) => {
            return (
              <photon-card>
                <div class="flex flex-row items-center">
                  <div class="flex flex-col flex-grow">
                    <p class="font-medium font-sans">{draft.treatment.name}</p>
                    <p class="font-normal text-gray-700 overflow-hidden overflow-ellipsis font-sans">
                      {/* draft.refillsInput exists here because we are displaying the number of refills, not fills, the user entered into the form as part of the drafted prescription.
                       We have this stored under refillsInput. This should not have a "+1" unless we update this to show fills*/}
                      {draft.dispenseQuantity} {draft.dispenseUnit}, {draft.refillsInput} refills -{' '}
                      {draft.instructions}
                    </p>
                  </div>
                  <div class="flex flex-row">
                    <sl-icon-button
                      class="self-end text-xl edit-icon-button"
                      name="pencil-square"
                      onClick={() => {
                        checkEditPrescription(draft.id);
                      }}
                    />
                    <sl-icon-button
                      class="self-end text-xl remove-icon-button"
                      name="trash3"
                      onClick={() => {
                        setDeleteDialogOpen(true);
                        setDeleteDraftId(draft.id);
                      }}
                    />
                  </div>
                </div>
              </photon-card>
            );
          }}
        </For>
      </div>
    </photon-card>
  );
};
