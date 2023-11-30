import { format } from 'date-fns';
import { customElement } from 'solid-element';
import { createSignal, onMount } from 'solid-js';
import { usePhoton } from '../context';
import jwtDecode from 'jwt-decode';
import { triggerToast, Button } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
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
    templateIds: undefined,
    prescriptionIds: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableMedHistory: false,
    mailOrderIds: undefined,
    enableOrder: false,
    toastBuffer: 0
  },
  (props: {
    enableMedHistory: boolean;
    hideTemplates?: boolean;
    patientId?: string;
    templateIds?: string;
    prescriptionIds?: string;
    weight?: number;
    weightUnit?: string;
    enableLocalPickup?: boolean;
    enableSendToPatient?: boolean;
    mailOrderIds?: string;
    enableOrder?: boolean;
    toastBuffer?: number;
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
            You have a prescription "{form()?.treatment?.value?.name}" that hasn't been added.
            Please add it or continue.
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
            props.enableOrder ? (
              <Button
                size="md"
                loading={triggerSubmit()}
                onClick={() => {
                  if (!canSubmit() || !canWritePrescription()) {
                    // show info error
                    triggerToast({
                      status: 'info',
                      body: 'You need to add prescription(s) to this order before you can send it.'
                    });
                  } else {
                    // submit rx and order
                    form()?.treatment?.value?.name
                      ? setContinueSubmitOpen(true)
                      : setTriggerSubmit(true);
                  }
                }}
              >
                Send Order
              </Button>
            ) : (
              <div class="flex flex-row gap-1 lg:gap-2 justify-end items-end">
                <Button
                  size="md"
                  variant="secondary"
                  loading={triggerSubmit() && !isCreateOrder()}
                  onClick={() => {
                    if (!canSubmit() || !canWritePrescription()) {
                      triggerToast({
                        status: 'info',
                        body: 'You need to add prescription(s) to this order before you can send it.'
                      });
                    } else {
                      setContinueSaveOnly(true);
                    }
                  }}
                >
                  Save prescriptions
                </Button>
                <Button
                  size="md"
                  loading={triggerSubmit() && isCreateOrder()}
                  onClick={() => {
                    if (!canSubmit() || !canWritePrescription()) {
                      triggerToast({
                        status: 'info',
                        body: 'You need to add prescription(s) to this order before you can send it.'
                      });
                    } else {
                      if (form()?.treatment?.value?.name) {
                        setContinueSubmitOpen(true);
                      } else {
                        setIsCreateOrder(true);
                        setTriggerSubmit(true);
                      }
                    }
                  }}
                >
                  Save and create order
                </Button>
              </div>
            )
          }
          form={
            <div class="w-full h-full bg-[#F9FAFB]">
              <div class="w-full h-full">
                <photon-prescribe-workflow
                  hide-submit="true"
                  hide-templates={props.hideTemplates}
                  loading={triggerSubmit()}
                  patient-id={props.patientId}
                  template-ids={props.templateIds}
                  prescription-ids={props.prescriptionIds}
                  weight={props.weight}
                  weight-unit={props.weightUnit}
                  enable-med-history={props.enableMedHistory}
                  enable-order={props.enableOrder}
                  enable-local-pickup={props.enableLocalPickup}
                  enable-send-to-patient={props.enableSendToPatient}
                  mail-order-ids={props.mailOrderIds}
                  trigger-submit={triggerSubmit()}
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
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }
);
