import { format } from 'date-fns';
import { customElement } from 'solid-element';
import { createSignal, onMount } from 'solid-js';
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
    templateIds: undefined,
    prescriptionIds: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableMedHistory: false,
    mailOrderIds: undefined
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
  }) => {
    let ref: any;
    const client = usePhoton();
    const [canSubmit, setCanSubmit] = createSignal<boolean>(false);
    const [canWritePrescription, setCanWritePrescription] = createSignal<boolean>(false);
    const [form, setForm] = createSignal<any>();
    const [continueSubmitOpen, setContinueSubmitOpen] = createSignal<boolean>(false);
    const [triggerSubmit, setTriggerSubmit] = createSignal<boolean>(false);
    const { actions: patientActions } = PatientStore;

    onMount(async () => {
      const token = await client!.getSDK().authentication.getAccessToken();

      const decoded: { permissions: string[] } = jwtDecode(token);

      if (decoded.permissions?.includes('write:prescription')) {
        setCanWritePrescription(true);
      }
    });

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
            <div class="flex flex-row gap-1 lg:gap-2 justify-end items-end">
              <photon-button
                size="sm"
                disabled={!canSubmit() || !canWritePrescription()}
                on:photon-clicked={() =>
                  form()?.treatment?.value?.name
                    ? setContinueSubmitOpen(true)
                    : setTriggerSubmit(true)
                }
                loading={triggerSubmit()}
              >
                Send Order
              </photon-button>
            </div>
          }
          form={
            <div class="w-full h-full bg-[#f7f4f4]">
              <div class="w-full h-full sm:w-[600px] xs:mx-auto">
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
                  enable-order={true}
                  enable-local-pickup={props.enableLocalPickup}
                  enable-send-to-patient={props.enableSendToPatient}
                  mail-order-ids={props.mailOrderIds}
                  trigger-submit={triggerSubmit()}
                  on:photon-form-validate={(e: any) => {
                    setCanSubmit(e.detail.canSubmit);
                    setForm(e.detail.form);
                  }}
                  on:photon-order-created={(e: any) => {
                    console.log('order created', e.detail);
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
