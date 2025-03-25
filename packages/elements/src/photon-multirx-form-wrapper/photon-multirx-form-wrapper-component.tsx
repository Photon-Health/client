import { Button, triggerToast } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { format } from 'date-fns';
import jwtDecode from 'jwt-decode';
import { customElement } from 'solid-element';
import { createSignal, onMount } from 'solid-js';
import { usePhoton } from '../context';
import { PhotonFormWrapper } from '../photon-form-wrapper';
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

const Component = (props: {
  enableMedHistory: boolean;
  enableMedHistoryLinks: boolean;
  enableMedHistoryRefillButton: boolean;
  hideTemplates?: boolean;
  patientId?: string;
  pharmacyId?: string;
  templateIds?: string;
  prescriptionIds?: string;
  weight?: number;
  weightUnit?: string;
  additionalNotes?: string;
  enableLocalPickup?: boolean;
  enableSendToPatient?: boolean;
  enableCombineAndDuplicate?: boolean;
  mailOrderIds?: string;
  enableOrder?: boolean;
  toastBuffer?: number;
  externalOrderId?: string;
}) => {
  let ref: any;
  const client = usePhoton();
  const [canSubmit, setCanSubmit] = createSignal<boolean>(false);
  const [canWritePrescription, setCanWritePrescription] = createSignal<boolean>(false);
  const [form, setForm] = createSignal<any>();
  const [continueSubmitOpen, setContinueSubmitOpen] = createSignal<boolean>(false);
  const [isCreateOrder, setIsCreateOrder] = createSignal<boolean>(false);
  const [continueSaveOnly, setContinueSaveOnly] = createSignal<boolean>(false);
  const [triggerSubmit, setTriggerSubmit] = createSignal<boolean>(false);
  const { actions: patientActions } = PatientStore;
  const [hideOrderButton, setHideOrderButton] = createSignal<boolean>(true);

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

  const handleUnsavedConfirm = () => {
    setContinueSubmitOpen(false);
    setTriggerSubmit(true);
  };
  const handleUnsavedCancel = () => setContinueSubmitOpen(false);

  const handleCreateOrder = () => {
    // Notify there aren't any draft prescriptions
    if (!canSubmit()) {
      return triggerToast({
        status: 'info',
        body: 'You need to add prescription(s) to this order before you can send it.'
      });
    }

    if (!canWritePrescription()) {
      return triggerToast({
        status: 'error',
        header: 'Unauthorized',
        body: 'You do not have permission to prescribe'
      });
    }

    // Show a dialog if there is a prescription that hasn't been added to draft prescriptions
    if (form()?.treatment?.value?.name) {
      return setContinueSubmitOpen(true);
    }

    // else if all good, create the order
    setIsCreateOrder(true);
    setTriggerSubmit(true);
  };

  const handleCreatePrescriptions = () => {
    // check if there are draft prescriptions
    if (!canSubmit()) {
      return triggerToast({
        status: 'info',
        body: 'You need to add prescription(s) to this order before you can send it.'
      });
    }

    if (!canWritePrescription()) {
      return triggerToast({
        status: 'error',
        header: 'Unauthorized',
        body: 'You do not have permission to prescribe'
      });
    }

    // create the prescriptions
    setContinueSaveOnly(true);
  };

  return (
    <div ref={ref}>
      <style>{photonStyles}</style>
      <photon-dialog
        label="Lose Unsaved Prescription?"
        open={continueSubmitOpen()}
        confirm-text="Yes, Continue"
        cancel-text="Keep Editing"
        on:photon-dialog-confirmed={handleUnsavedConfirm}
        on:photon-dialog-canceled={handleUnsavedCancel}
        on:photon-dialog-alt={handleUnsavedCancel}
        width="500px"
      >
        <p class="font-sans text-lg xs:text-base">
          You have a prescription "{form()?.treatment?.value?.name}" that hasn't been added. Please
          add it or continue.
        </p>
      </photon-dialog>

      <photon-dialog
        label="Save prescriptions without an order?"
        open={continueSaveOnly()}
        confirm-text="Save and create order"
        cancel-text="Yes, Save Only"
        on:photon-dialog-confirmed={() => {
          setContinueSaveOnly(false);
          setIsCreateOrder(true);
          setTriggerSubmit(true);
        }}
        on:photon-dialog-canceled={() => {
          setContinueSaveOnly(false);
        }}
        on:photon-dialog-alt={() => {
          setContinueSaveOnly(false);
          setTriggerSubmit(true);
        }}
        width="500px"
      >
        <p class="font-sans text-lg xs:text-base">
          You're about to save prescriptions without creating a pharmacy order. You can create an
          order now, or at a later date.
        </p>
      </photon-dialog>

      <PhotonFormWrapper
        closeTitle="Lose unsaved prescriptions?"
        closeBody="You will not be able to recover unsaved prescriptions."
        onClosed={() => {
          dispatchClosed();
          patientActions.clearSelectedPatient();
        }}
        checkShouldWarn={() => shouldWarn(form)}
        title="New Prescriptions"
        titleIconName="prescription"
        headerRight={
          hideOrderButton() ? null : props.enableOrder ? (
            <Button size="md" loading={triggerSubmit()} onClick={handleCreateOrder}>
              Send Order
            </Button>
          ) : (
            <div class="flex flex-row gap-1 lg:gap-2 justify-end items-end">
              <Button
                size="md"
                variant="secondary"
                loading={triggerSubmit() && !isCreateOrder()}
                onClick={handleCreatePrescriptions}
              >
                Save prescriptions
              </Button>
              <Button
                size="md"
                loading={triggerSubmit() && isCreateOrder()}
                onClick={handleCreateOrder}
              >
                Save and create order
              </Button>
            </div>
          )
        }
        form={
          <div class="w-full h-full bg-[#F9FAFB]">
            <photon-prescribe-workflow
              hide-submit="true"
              hide-templates={props.hideTemplates}
              loading={triggerSubmit()}
              patient-id={props.patientId}
              template-ids={props.templateIds}
              prescription-ids={props.prescriptionIds}
              weight={props.weight}
              weight-unit={props.weightUnit}
              external-order-id={props.externalOrderId}
              additional-notes={props.additionalNotes}
              enable-med-history={props.enableMedHistory}
              enable-med-history-links={props.enableMedHistoryLinks}
              enable-med-history-refill-button={props.enableMedHistoryRefillButton}
              enable-order={props.enableOrder}
              enable-local-pickup={props.enableLocalPickup}
              enable-send-to-patient={props.enableSendToPatient}
              enable-combine-and-duplicate={props.enableCombineAndDuplicate}
              pharmacy-id={props.pharmacyId}
              mail-order-ids={props.mailOrderIds}
              trigger-submit={triggerSubmit()}
              set-trigger-submit={setTriggerSubmit}
              toast-buffer={props?.toastBuffer || 0}
              on:photon-form-validate={(e: any) => {
                setCanSubmit(e.detail.canSubmit);
                setForm(e.detail.form);
              }}
              on:photon-prescriptions-created={(e: any) => {
                e.stopPropagation();
                if (!props.enableOrder) {
                  dispatchPrescriptionsCreated(
                    isCreateOrder(),
                    e.detail.prescriptions.map((p: { id: string }) => p.id),
                    form()?.patient?.value?.id
                  );
                }
              }}
              on:photon-order-error={(e: any) => {
                e.stopPropagation();
                setTriggerSubmit(false);
              }}
              on:photon-order-combine-error={(e: any) => {
                e.stopPropagation();
                setTriggerSubmit(false);
              }}
              on:photon-signature-attestation-agreed={() => {
                setHideOrderButton(false);
              }}
              on:photon-signature-attestation-canceled={() => {
                dispatchClosed();
                patientActions.clearSelectedPatient();
              }}
              on:photon-clinical-alert-cancel={(e: any) => {
                e.stopPropagation();
                setTriggerSubmit(false);
              }}
            />
          </div>
        }
      />
    </div>
  );
};
customElement(
  'photon-multirx-form-wrapper',
  {
    hideTemplates: false,
    patientId: undefined,
    pharmacyId: undefined,
    templateIds: undefined,
    prescriptionIds: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    additionalNotes: undefined,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableMedHistory: false,
    enableMedHistoryLinks: false,
    enableMedHistoryRefillButton: false,
    enableCombineAndDuplicate: false,
    mailOrderIds: undefined,
    enableOrder: false,
    toastBuffer: 0,
    externalOrderId: undefined
  },
  Component
);
