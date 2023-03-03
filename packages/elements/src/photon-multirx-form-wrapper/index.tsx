import { format } from 'date-fns';
import { customElement } from 'solid-element';
import { createSignal, For, onMount, Show } from 'solid-js';
import { usePhoton } from '../context';
import jwtDecode from 'jwt-decode';
import PhotonFormWrapper from '../photon-form-wrapper';
import { PatientStore } from '../stores/patient';

const shouldWarn = (form: any) =>
  form()['notes']?.value.length > 0 ||
  form()['instructions']?.value.length > 0 ||
  form()['treatment']?.value ||
  form()['patient']?.value ||
  form()['dispenseAsWritten']?.value != false ||
  form()['dispenseQuantity']?.value != 1 ||
  form()['dispenseUnit']?.value != 'Each' ||
  form()['daysSupply']?.value != 30 ||
  form()['refillsInput']?.value != 0 ||
  form()['addToTemplates']?.value != false ||
  form()['effectiveDate']?.value != format(new Date(), 'yyyy-MM-dd').toString() ||
  form()['draftPrescriptions']?.value.length > 0;

customElement(
  'photon-multirx-form-wrapper',
  {
    hideTemplates: false,
    patientId: undefined,
    templateIds: undefined
  },
  (props: { hideTemplates?: boolean; patientId?: string; templateIds?: string }) => {
    let ref: any;
    const client = usePhoton();
    const [canSubmit, setCanSubmit] = createSignal<boolean>(false);
    const [submitErrors, setSubmitErrors] = createSignal<readonly Error[]>([]);
    const [canWritePrescription, setCanWritePrescription] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);
    const [form, setForm] = createSignal<any>();
    const [actions, setActions] = createSignal<any>();
    const [continueSubmitOpen, setContinueSubmitOpen] = createSignal<boolean>(false);
    const { actions: patientActions } = PatientStore;

    onMount(async () => {
      const token = await client!.getSDK().authentication.getAccessToken();
      const decoded: { permissions: string[] } = jwtDecode(token);

      if (decoded.permissions?.includes('write:prescription')) {
        setCanWritePrescription(true);
      }
    });

    const dispatchPrescriptionsCreated = (
      createOrder: boolean,
      prescriptionIds: string[],
      patientId: string
    ) => {
      const event = new CustomEvent('photon-prescriptions-created', {
        composed: true,
        bubbles: true,
        detail: {
          patientId,
          prescriptionIds,
          createOrder
        }
      });
      ref?.dispatchEvent(event);
    };

    const dispatchClosed = () => {
      const event = new CustomEvent('photon-prescriptions-closed', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

    const submitForm = async (store: any, actions: any, createOrder: boolean) => {
      setSubmitErrors([]);
      const keys = ['patient', 'draftPrescriptions'];
      actions.validate(keys);
      const errorsPresent = actions.hasErrors(keys);
      if (!errorsPresent) {
        setIsLoading(true);
        actions.updateFormValue({
          key: 'errors',
          value: []
        });
        const rxMutation = client!.getSDK().clinical.prescription.createPrescriptions({});
        const templateMutation = client!
          .getSDK()
          .clinical.prescriptionTemplate.createPrescriptionTemplate({});
        const prescriptions = [];
        for (const draft of store['draftPrescriptions']!.value) {
          if (draft.addToTemplates) {
            try {
              const { errors } = await templateMutation({
                variables: {
                  catalogId: draft.catalogId,
                  treatmentId: draft.treatment.id,
                  dispenseAsWritten: draft.dispenseAsWritten,
                  dispenseQuantity: draft.dispenseQuantity,
                  dispenseUnit: draft.dispenseUnit,
                  // this is what is being sent to graphQL to create the template. we store the refill input as part of the draft
                  // so a '+1' is needed in order to be passed in as the variable for fillsAllowed
                  fillsAllowed: draft.refillsInput + 1,
                  daysSupply: draft.daysSupply,
                  instructions: draft.instructions,
                  notes: draft.notes
                },
                awaitRefetchQueries: false
              });
              if (errors) {
                setSubmitErrors(errors);
              }
            } catch (err) {
              setSubmitErrors([err as Error]);
            }
          }
          const args = {
            daysSupply: draft.daysSupply,
            dispenseAsWritten: draft.dispenseAsWritten,
            dispenseQuantity: draft.dispenseQuantity,
            dispenseUnit: draft.dispenseUnit,
            effectiveDate: draft.effectiveDate,
            instructions: draft.instructions,
            notes: draft.notes,
            patientId: store['patient']?.value.id,
            // This is what is being sent to graphQL to create the prescription. We store the refill input as part of the drafted prescription under "refillsInput"
            // so a '+1' is needed in order to be passed in as the variable for fillsAllowed to accurately represent the total number of fills.
            fillsAllowed: draft.refillsInput + 1,
            treatmentId: draft.treatment.id
          };
          prescriptions.push(args);
        }
        if (submitErrors().length > 0) {
          return;
        }
        try {
          const { data, errors } = await rxMutation({
            variables: {
              prescriptions
            },
            refetchQueries: [],
            awaitRefetchQueries: false
          });
          if (errors) {
            setSubmitErrors(errors as readonly Error[]);
            return;
          }
          dispatchPrescriptionsCreated(
            createOrder,
            data!.createPrescriptions.map((x) => x.id),
            store['patient']?.value.id
          );
        } catch (err) {
          setSubmitErrors([err as Error]);
        }
        setIsLoading(false);
      }
    };

    const handleSubmit = () => submitForm(form(), actions(), true);

    return (
      <div ref={ref}>
        <photon-dialog
          label="Lose Unsaved Prescription?"
          open={continueSubmitOpen()}
          confirm-text="Yes, Continue"
          cancel-text="Keep Editing"
          on:photon-dialog-confirmed={() => {
            setContinueSubmitOpen(false);
            handleSubmit();
          }}
          on:photon-dialog-canceled={() => {
            setContinueSubmitOpen(false);
          }}
          width="500px"
        >
          <p class="font-sans text-lg xs:text-base">
            You have a prescription "{form()?.treatment?.value?.name}" that hasn't been added.
            Please add it or continue.
          </p>
        </photon-dialog>

        <PhotonFormWrapper
          closeTitle="Lose unsaved prescriptions?"
          closeBody="You will not be able to recover unsaved prescriptions."
          onClosed={() => {
            dispatchClosed();
            patientActions.clearSelectedPatient();
            props.open = false;
          }}
          checkShouldWarn={() => shouldWarn(form)}
          title="New Prescriptions"
          titleIconName="prescription"
          headerRight={
            <div class="flex flex-row gap-1 lg:gap-2 justify-end items-end">
              <photon-button
                size="sm"
                variant="outline"
                loading-text="Save prescriptions"
                disabled={!canSubmit() || !canWritePrescription()}
                loading={isLoading()}
                on:photon-clicked={() => submitForm(form(), actions(), false)}
              >
                <span className="text-xs lg:text-sm">Save prescriptions</span>
              </photon-button>
              <photon-button
                size="sm"
                loading-text="Save and create order"
                disabled={!canSubmit() || !canWritePrescription()}
                loading={isLoading()}
                on:photon-clicked={() =>
                  form()?.treatment?.value?.name ? setContinueSubmitOpen(true) : handleSubmit()
                }
              >
                <span className="text-xs lg:text-sm">Save and create order</span>
              </photon-button>
            </div>
          }
          form={
            <div class="w-full h-full bg-[#f7f4f4]">
              <Show when={submitErrors().length > 0}>
                <For each={submitErrors()}>
                  {(error) => (
                    <div class="pt-2">
                      <sl-alert variant="danger" open>
                        <div class="flex items-start xs:items-center gap-4">
                          <sl-icon
                            slot="icon"
                            name="exclamation-octagon"
                            class="text-red-500"
                            style="font-size: 24px;"
                          ></sl-icon>
                          <p class="font-sans">{error.message}</p>
                        </div>
                      </sl-alert>
                    </div>
                  )}
                </For>
              </Show>
              <div class="p-4 w-full h-full sm:w-[600px] xs:mx-auto">
                <photon-prescribe-workflow
                  hide-submit="true"
                  hide-templates={props.hideTemplates}
                  loading={isLoading()}
                  patient-id={props.patientId}
                  template-ids={props.templateIds}
                  on:photon-form-validate={(e: any) => {
                    setCanSubmit(e.detail.canSubmit);
                    setActions(e.detail.actions);
                    setForm(e.detail.form);
                  }}
                ></photon-prescribe-workflow>
              </div>
            </div>
          }
        ></PhotonFormWrapper>
      </div>
    );
  }
);
