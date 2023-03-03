import { createSignal, For, Show } from 'solid-js';
import { message } from '../../validators';
import { size, array, any } from 'superstruct';

const draftPrescriptionsValidator = message(
  size(array(any()), 1, Infinity),
  'You must add at least 1 Prescription'
);

export const DraftPrescriptionCard = (props: {
  actions: Record<string, Function>;
  store: Record<string, any>;
  isLoading: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = createSignal<boolean>(false);
  const [selectedDraft, setSelectedDraft] = createSignal<string | undefined>();

  props.actions.registerValidator({
    key: 'draftPrescriptions',
    validator: draftPrescriptionsValidator
  });

  const editPrescription = (id: string) => {
    const draft = props.store['draftPrescriptions'].value.find((x: any) => x.id === id);
    console.log('draft', draft);
    //   props.actions.updateFormValue({
    //     key: 'treatment',
    //     value: e.detail.data.treatment
    //   });
    //   if (e.detail.data.dispenseAsWritten) {
    //     props.actions.updateFormValue({
    //       key: 'dispenseAsWritten',
    //       value: e.detail.data.dispenseAsWritten
    //     });
    //   }
    //   if (e.detail.data.dispenseQuantity) {
    //     props.actions.updateFormValue({
    //       key: 'dispenseQuantity',
    //       value: Number(e.detail.data.dispenseQuantity)
    //     });
    //   }
    //   if (e.detail.data.dispenseUnit) {
    //     props.actions.updateFormValue({
    //       key: 'dispenseUnit',
    //       value: e.detail.data.dispenseUnit
    //     });
    //   }
    //   if (e.detail.data.daysSupply) {
    //     props.actions.updateFormValue({
    //       key: 'daysSupply',
    //       value: Number(e.detail.data.daysSupply)
    //     });
    //   }
    //   // if a template is selected in the treatment dropdown, field needs to update to use the fillsAllowed value from the template.
    //   // this is why there is a -1 here.
    //   if (e.detail.data.fillsAllowed) {
    //     props.actions.updateFormValue({
    //       key: 'refillsInput',
    //       value: Number(e.detail.data.fillsAllowed) - 1
    //     });
    //   }
    //   if (e.detail.data.instructions) {
    //     props.actions.updateFormValue({
    //       key: 'instructions',
    //       value: e.detail.data.instructions
    //     });
    //   }
    //   if (e.detail.data.notes) {
    //     props.actions.updateFormValue({
    //       key: 'notes',
    //       value: e.detail.data.notes
    //     });
    //   }
    // } else {
    //   props.actions.updateFormValue({
    //     key: 'treatment',
    //     value: e.detail.data
    //   });
    // }
    // props.actions.updateFormValue({
    //   key: 'catalogId',
    //   value: e.detail.catalogId
    // });

    // remove the draft from the list
    props.actions.updateFormValue({
      key: 'draftPrescriptions',
      value: props.store['draftPrescriptions'].value.filter((x: any) => x.id !== id)
    });
  };

  return (
    <photon-card>
      <photon-dialog
        open={dialogOpen()}
        label="Delete pending prescription?"
        confirm-text="Yes, Delete"
        cancel-text="No, Cancel"
        on:photon-dialog-confirmed={() => {
          props.actions.updateFormValue({
            key: 'draftPrescriptions',
            value: props.store['draftPrescriptions'].value.filter(
              (x: any) => x.id !== selectedDraft()
            )
          });
          setDialogOpen(false);
          setSelectedDraft(undefined);
        }}
        on:photon-dialog-canceled={() => {
          setDialogOpen(false);
          setSelectedDraft(undefined);
        }}
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
                <sl-spinner style="font-size: 1rem;"></sl-spinner>
              </div>
            </photon-card>
          </div>
        </Show>
        <For each={props.store['draftPrescriptions']?.value ?? []}>
          {(draft: any) => {
            return (
              <photon-card>
                <div class="flex flex-row items-center">
                  <div class="flex flex-col flex-grow" style="max-width: calc(100% - 36px);">
                    <p class="font-medium font-sans">{draft.treatment.name}</p>
                    <p class="font-normal text-gray-700 overflow-hidden whitespace-nowrap overflow-ellipsis font-sans">
                      {/* draft.refillsInput exists here because we are displaying the number of refills, not fills, the user entered into the form as part of the drafted prescription.
                       We have this stored under refillsInput. This should not have a "+1" unless we update this to show fills*/}
                      {draft.dispenseQuantity} {draft.dispenseUnit}, {draft.refillsInput} refills -{' '}
                      {draft.instructions}
                    </p>
                  </div>
                  <div>
                    <sl-icon-button
                      class="self-end text-xl edit-icon-button"
                      name="pencil-square"
                      onclick={() => {
                        editPrescription(draft.id);
                      }}
                    ></sl-icon-button>
                    <sl-icon-button
                      class="self-end text-xl remove-icon-button"
                      name="trash3"
                      onclick={() => {
                        setDialogOpen(true);
                        setSelectedDraft(draft.id);
                      }}
                    ></sl-icon-button>
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
