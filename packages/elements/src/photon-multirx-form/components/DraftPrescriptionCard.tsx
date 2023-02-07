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
    validator: draftPrescriptionsValidator,
  });

  return (
    <photon-card>
      <photon-dialog
        open={dialogOpen()}
        label="Lose pending prescription?"
        confirm-text="Yes, Cancel"
        cancel-text="No, Keep Editing"
        on:photon-dialog-confirmed={() => {
          props.actions.updateFormValue({
            key: 'draftPrescriptions',
            value: props.store['draftPrescriptions'].value.filter(
              (x: any) => x.id !== selectedDraft()
            ),
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
          You have selected to remove a pending prescription. Continuing will remove it from the
          list of prescriptions to be created.
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
