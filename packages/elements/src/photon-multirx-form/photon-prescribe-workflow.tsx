//Shoelace Components
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import {
  Alert,
  Button,
  RecentOrders,
  SignatureAttestationModal,
  Spinner,
  TemplateOverrides,
  Toaster,
  triggerToast,
  useRecentOrders
} from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { Order, Prescription } from '@photonhealth/sdk/dist/types';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import { GraphQLError } from 'graphql';
import { For, Ref, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { usePhoton } from '../context';
import { PhotonAuthorized } from '../photon-authorized';
import type { FormError } from '../stores/form';
import tailwind from '../tailwind.css?inline';
import { AddPrescriptionCard } from './components/AddPrescriptionCard';
import { DraftPrescriptionCard } from './components/DraftPrescriptionCard';
import { OrderCard } from './components/OrderCard';
import { PatientCard } from './components/PatientCard';
import { PharmacyCard } from './components/PharmacyCard';
import styles from './style.css?inline';
import clearForm from './util/clearForm';
import { formatPatientWeight } from './util/formatPatientWeight';
import { checkHasPermission } from '../utils';

export type Address = {
  city: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: string;
  country?: string;
};

export type PrescribeProps = {
  patientId?: string;
  templateIds?: string;
  templateOverrides?: TemplateOverrides;
  prescriptionIds?: string;
  hideSubmit: boolean;
  hideTemplates: boolean;
  enableOrder: boolean;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableMedHistory: boolean;
  enableCombineAndDuplicate: boolean;
  mailOrderIds?: string;
  pharmacyId?: string;
  loading: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  generalNotes?: string;
  triggerSubmit: boolean;
  setTriggerSubmit?: (val: boolean) => void;
  toastBuffer: number;
  formStore?: any;
  formActions?: any;
  externalOrderId?: string;
};

export function PrescribeWorkflow(props: PrescribeProps) {
  let ref: Ref<any> | undefined;

  const client = usePhoton();
  const [showForm, setShowForm] = createSignal<boolean>(
    !props.templateIds && !props.prescriptionIds
  );
  const [errors, setErrors] = createSignal<FormError[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const [authenticated, setAuthenticated] = createSignal<boolean>(
    client?.authentication.state.isAuthenticated || false
  );
  const [, recentOrdersActions] = useRecentOrders();

  // we can ignore the warnings to put inside of a createEffect, the generalNotes or weight shouldn't be updating
  let prefillNotes = '';
  if (props.generalNotes) {
    prefillNotes = `${props.generalNotes}

`;
  }
  if (props.weight) {
    prefillNotes = `${prefillNotes}${formatPatientWeight(props.weight, props?.weightUnit)}`;
  }

  onMount(() => {
    if (props.address) {
      // if manually overriding address, update the store on mount
      props.formActions.updateFormValue({
        key: 'address',
        value: props.address
      });
    }

    ref.addEventListener('photon-ticket-created-duplicate', () => {
      clearForm(props.formActions, prefillNotes ? { notes: prefillNotes } : undefined);
    });
  });

  createEffect(() => {
    if (
      !client?.authentication.state.isAuthenticated &&
      !client?.authentication.state.isLoading &&
      !client?.authentication.state.error &&
      client?.autoLogin // don't attempt to login if auto-login=false
    ) {
      client?.authentication.login({ appState: { returnTo: window.location.pathname } });
    }
  });
  createEffect(() => {
    setIsLoading(client?.authentication.state.isLoading || false);
  });
  createEffect(() => {
    setAuthenticated(client?.authentication.state.isAuthenticated || false);
  });

  const hasPrescribePermission = createMemo(() =>
    checkHasPermission(['write:prescription'], client?.authentication.state.permissions || [])
  );

  const formattedAddress = createMemo(() => {
    // remove unnecessary fields, and add country and street2 if missing
    const patientAddress =
      props.formStore?.address?.value ?? props.formStore?.patient?.value?.address ?? {};
    const { __typename, name, ...filteredPatientAddress } = patientAddress;
    const address = { street2: '', country: 'US', ...filteredPatientAddress };
    return address;
  });

  const dispatchPrescriptionsCreated = (prescriptions: Prescription[]) => {
    const event = new CustomEvent('photon-prescriptions-created', {
      composed: true,
      bubbles: true,
      detail: {
        prescriptions: prescriptions
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchOrderCreated = (order: Order) => {
    const event = new CustomEvent('photon-order-created', {
      composed: true,
      bubbles: true,
      detail: {
        order: order
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchPrescriptionsError = (errors: readonly GraphQLError[]) => {
    const event = new CustomEvent('photon-prescriptions-error', {
      composed: true,
      bubbles: true,
      detail: {
        errors: errors
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchOrderError = (errors: readonly GraphQLError[] = []) => {
    const event = new CustomEvent('photon-order-error', {
      composed: true,
      bubbles: true,
      detail: {
        errors: errors
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchPrescriptionsFormValidate = (canSubmit: boolean) => {
    const event = new CustomEvent('photon-form-validate', {
      composed: true,
      bubbles: true,
      detail: {
        canSubmit: canSubmit,
        form: props.formStore,
        actions: props.formActions
      }
    });
    ref?.dispatchEvent(event);
  };

  // before submitting the form, show combine dialog if there is a routing order for the patient
  const displayCombineDialog = () => {
    return recentOrdersActions.setIsCombineDialogOpen(
      true,
      () => submitForm(props.enableOrder),
      props.formStore.draftPrescriptions.value,
      formattedAddress()
    );
  };

  // submits the form to create a new order
  const submitForm = async (enableOrder: boolean) => {
    setErrors([]);

    if (!hasPrescribePermission()) {
      return triggerToast({
        status: 'error',
        header: 'Unauthorized',
        body: 'You do not have permission to prescribe'
      });
    }

    const keys = enableOrder
      ? ['patient', 'draftPrescriptions', 'pharmacy', 'address']
      : ['patient', 'draftPrescriptions'];
    props.formActions.validate(keys);
    const errors = props.formActions.getErrors(keys);
    if (errors.length === 0) {
      setIsLoading(true);
      props.formActions.updateFormValue({
        key: 'errors',
        value: []
      });
      const orderMutation = client!.getSDK().clinical.order.createOrder({});
      const removePatientPreferredPharmacyMutation = client!
        .getSDK()
        .clinical.patient.removePatientPreferredPharmacy({});
      const updatePatientMutation = client!.getSDK().clinical.patient.updatePatient({});
      const rxMutation = client!.getSDK().clinical.prescription.createPrescriptions({});
      const prescriptions = [];
      const templateMutation = client!
        .getSDK()
        .clinical.prescriptionTemplate.createPrescriptionTemplate({});

      for (const draft of props.formStore.draftPrescriptions!.value) {
        const args = {
          daysSupply: draft.daysSupply,
          dispenseAsWritten: draft.dispenseAsWritten,
          dispenseQuantity: draft.dispenseQuantity,
          dispenseUnit: draft.dispenseUnit,
          effectiveDate: draft.effectiveDate,
          instructions: draft.instructions,
          notes: draft.notes,
          patientId: props.formStore.patient?.value.id,
          // +1 here because we're using the refillsInput
          fillsAllowed: draft.refillsInput ? draft.refillsInput + 1 : 1,
          treatmentId: draft.treatment.id
        };
        if (draft.addToTemplates) {
          try {
            const { errors } = await templateMutation({
              variables: {
                ...args,
                catalogId: draft.catalogId,
                isPrivate: true
              },
              awaitRefetchQueries: false
            });
            if (errors) {
              dispatchOrderError(errors);
            }
          } catch (err) {
            dispatchOrderError([err as GraphQLError]);
          }
        }
        prescriptions.push(args);
      }
      try {
        const { data: prescriptionData, errors } = await rxMutation({
          variables: {
            prescriptions
          },
          refetchQueries: [],
          awaitRefetchQueries: false
        });

        if (!props.enableOrder) {
          setIsLoading(false);
        }
        if (errors) {
          dispatchPrescriptionsError(errors);
          return;
        }
        dispatchPrescriptionsCreated(prescriptionData!.createPrescriptions);
        if (props.enableOrder) {
          if (
            props.formStore.updatePreferredPharmacy?.value &&
            props.formStore.pharmacy?.value &&
            props.formStore.fulfillmentType?.value === 'PICK_UP'
          ) {
            const patient = props.formStore.patient?.value;
            if (patient?.preferredPharmacies && patient?.preferredPharmacies?.length > 0) {
              // remove the current preferred pharmacy
              removePatientPreferredPharmacyMutation({
                variables: {
                  patientId: patient.id,
                  pharmacyId: patient?.preferredPharmacies?.[0]?.id
                },
                awaitRefetchQueries: false
              });
            }
            // add the new preferred pharmacy to the patient
            updatePatientMutation({
              variables: {
                id: patient.id,
                preferredPharmacies: [props.formStore.pharmacy?.value]
              },
              awaitRefetchQueries: false
            });
          }

          const { data: orderData, errors } = await orderMutation({
            variables: {
              ...(props.externalOrderId ? { externalId: props.externalOrderId } : {}),
              patientId: props.formStore.patient?.value.id,
              pharmacyId: props?.pharmacyId || props.formStore.pharmacy?.value || '',
              fulfillmentType: props.formStore.fulfillmentType?.value || '',
              address: formattedAddress(),
              fills: prescriptionData?.createPrescriptions.map((x) => ({ prescriptionId: x.id }))
            },
            refetchQueries: [],
            awaitRefetchQueries: false
          });

          if (props.enableOrder) {
            setIsLoading(false);
          }
          if (errors) {
            dispatchOrderError(errors);
            return;
          }
          dispatchOrderCreated(orderData!.createOrder);
        }
      } catch (err) {
        dispatchOrderError([err as GraphQLError]);
        setIsLoading(false);
        triggerToast({
          status: 'error',
          header: 'Error Creating Order',
          body: (err as GraphQLError)?.message
        });
      }
    } else {
      setErrors(errors);
    }
  };

  // decide whether to show the combine modal or submit the form
  const combineOrSubmit = () => {
    if (props.enableCombineAndDuplicate && recentOrdersActions.hasRoutingOrder()) {
      return displayCombineDialog();
    }
    return submitForm(props.enableOrder);
  };

  createEffect(() => {
    if (props.triggerSubmit) {
      combineOrSubmit();
    }
  });

  createEffect(() => {
    dispatchPrescriptionsFormValidate(
      Boolean(
        props.formStore.draftPrescriptions?.value?.length > 0 && props.formStore.patient?.value
      )
    );
  });

  const clinicalClient = client!.sdk.apolloClinical;

  let prescriptionRef: HTMLDivElement | undefined;

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <style>{photonStyles}</style>

      <Show when={props.enableCombineAndDuplicate}>
        <RecentOrders.DuplicateDialog />
        <RecentOrders.CombineDialog />
        <RecentOrders.IssueDialog />
      </Show>

      <div>
        <Toaster buffer={props?.toastBuffer || 0} />
        <div class="flex flex-col gap-8">
          <Show when={(!client || isLoading()) && !authenticated()}>
            <div class="w-full flex justify-center">
              <Spinner color="green" />
            </div>
          </Show>
          <PhotonAuthorized permissions={['read:patient']}>
            <SignatureAttestationModal client={clinicalClient}>
              <Show when={!hasPrescribePermission()}>
                <Alert
                  type="warning"
                  header="You do not have permission to prescribe"
                  message="You have access to see the form but you will not be able to submit an order."
                />
              </Show>
              <PatientCard
                actions={props.formActions}
                store={props.formStore}
                patientId={props.patientId}
                client={client!}
                enableOrder={props.enableOrder}
                address={props.address}
                weight={props.weight}
                weightUnit={props.weightUnit}
                enableMedHistory={props.enableMedHistory}
              />
              <Show
                when={
                  props.formStore.patient?.value?.address ||
                  (props.formStore.patient?.value?.id && !props.enableOrder)
                }
              >
                <Show when={props.enableCombineAndDuplicate}>
                  <RecentOrders.Card />
                </Show>
                <Show when={showForm() || isEditing()}>
                  <div ref={prescriptionRef}>
                    <AddPrescriptionCard
                      hideAddToTemplates={props.hideTemplates}
                      actions={props.formActions}
                      store={props.formStore}
                      weight={props.weight}
                      weightUnit={props.weightUnit}
                      prefillNotes={prefillNotes}
                      enableCombineAndDuplicate={props.enableCombineAndDuplicate}
                    />
                  </div>
                </Show>
                <DraftPrescriptionCard
                  templateIds={props.templateIds?.split(',') || []}
                  templateOverrides={props.templateOverrides || {}}
                  prescriptionIds={props.prescriptionIds?.split(',') || []}
                  prescriptionRef={prescriptionRef}
                  actions={props.formActions}
                  store={props.formStore}
                  setIsEditing={setIsEditing}
                />
                <Show when={props.enableOrder && !props.pharmacyId}>
                  <OrderCard
                    store={props.formStore}
                    actions={props.formActions}
                    enableLocalPickup={props.enableLocalPickup}
                    enableSendToPatient={props.enableSendToPatient}
                    mailOrderIds={props.mailOrderIds}
                  />
                </Show>
                <Show when={props.enableOrder && props.pharmacyId}>
                  <PharmacyCard pharmacyId={props.pharmacyId} />
                </Show>
                <Show when={!props.hideSubmit}>
                  {/* We're hiding this alert message if enable-order is set, a rough way to let us know this is not in the App.
              The issue we're having is when props are passed and cards are hidden, the form is not showing validation errors. */}
                  <Show when={errors().length > 0 && props.enableOrder}>
                    <div class="m-3 gap-4">
                      <For each={errors()} fallback={<div>No errors...</div>}>
                        {({ key, error }: { key: string; error: string }) => (
                          <Alert type="warning" header={`Error with ${key}`} message={error} />
                        )}
                      </For>
                    </div>
                  </Show>
                  <div class="flex flex-row justify-end gap-2">
                    <Show when={!showForm()}>
                      <Button variant="secondary" onClick={() => setShowForm(true)}>
                        Add Prescription
                      </Button>
                    </Show>
                    <Button loading={isLoading()} onClick={combineOrSubmit}>
                      {props.enableOrder ? 'Send Order' : 'Save Prescriptions'}
                    </Button>
                  </div>
                </Show>
              </Show>
            </SignatureAttestationModal>
          </PhotonAuthorized>
        </div>
      </div>
    </div>
  );
}
