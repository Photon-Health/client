import { customElement } from 'solid-element';

//Shoelace Components
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { createEffect, onMount, createSignal, Show, For } from 'solid-js';
import type { FormError } from '../stores/form';
import { createFormStore } from '../stores/form';
import { usePhoton } from '../context';
import { Spinner, Toaster, Button, RecentOrders, useRecentOrders } from '@photonhealth/components';
import { Order, Prescription } from '@photonhealth/sdk/dist/types';
import { AddPrescriptionCard } from './components/AddPrescriptionCard';
import { PatientCard } from './components/PatientCard';
import { DraftPrescriptionCard } from './components/DraftPrescriptionCard';
import { GraphQLError } from 'graphql';
import { OrderCard } from './components/OrderCard';
import { PharmacyCard } from './components/PharmacyCard';
import { PhotonAuthorized } from '../photon-authorized';

import type { TemplateOverrides } from '@photonhealth/components';

export type Address = {
  city: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: string;
  country?: string;
};

type PrescribeProps = {
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
  mailOrderIds?: string;
  pharmacyId?: string;
  loading: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  triggerSubmit: boolean;
  setTriggerSubmit?: (val: boolean) => void;
  toastBuffer: number;
  formStore?: any;
  formActions?: any;
};

function PrescribeWorkflow(props: PrescribeProps) {
  let ref: any;

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

  onMount(() => {
    if (props.address) {
      // if manually overriding address, update the store on mount
      props.formActions.updateFormValue({
        key: 'address',
        value: props.address
      });
    }
  });

  createEffect(() => {
    if (
      !client?.authentication.state.isAuthenticated &&
      !client?.authentication.state.isLoading &&
      !client?.authentication.state.error
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
    dispatchOrderError();
    return recentOrdersActions.setIsCombineDialogOpen(
      true,
      () => submitForm(props.enableOrder),
      props.formStore.draftPrescriptions.value
    );
  };

  // submits the form to create a new order
  const submitForm = async (enableOrder: boolean) => {
    setErrors([]);

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
        // remove unnecessary fields, and add country and street2 if missing
        const patientAddress =
          props.formStore?.address?.value ?? props.formStore?.patient?.value?.address ?? {};
        const { __typename, name, ...filteredPatientAddress } = patientAddress;
        const address = { street2: '', country: 'US', ...filteredPatientAddress };

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
            patientId: props.formStore.patient?.value.id,
            pharmacyId: props?.pharmacyId || props.formStore.pharmacy?.value || '',
            fulfillmentType: props.formStore.fulfillmentType?.value || '',
            address,
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
    } else {
      setErrors(errors);
    }
  };

  // decide whether to show the combine modal or submit the form
  const combineOrSubmit = () => {
    if (recentOrdersActions.hasRoutingOrder()) {
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

  let prescriptionRef: HTMLDivElement | undefined;

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <style>{photonStyles}</style>

      <RecentOrders.DuplicateDialog />
      <RecentOrders.CombineDialog />
      <RecentOrders.IssueDialog />

      <div>
        <Toaster buffer={props?.toastBuffer || 0} />
        <div class="flex flex-col gap-8">
          <Show when={(!client || isLoading()) && !authenticated()}>
            <div class="w-full flex justify-center">
              <Spinner color="green" />
            </div>
          </Show>
          <PhotonAuthorized permissions={['write:prescription']}>
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
              <RecentOrders.Card />
              <Show when={showForm() || isEditing()}>
                <div ref={prescriptionRef}>
                  <AddPrescriptionCard
                    hideAddToTemplates={props.hideTemplates}
                    actions={props.formActions}
                    store={props.formStore}
                    weight={props.weight}
                    weightUnit={props.weightUnit}
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
                  <div class="m-3">
                    <For each={errors()} fallback={<div>No errors...</div>}>
                      {({ key, error }: { key: string; error: string }) => (
                        <sl-alert variant="warning" open>
                          <sl-icon slot="icon" name="exclamation-triangle" />
                          <strong>Error with {key}: </strong>
                          <br />
                          {error}
                          <br />
                          {JSON.stringify(props.formStore?.[key]?.value || {})}
                        </sl-alert>
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
                  <Button loading={isLoading()} onClick={() => props.enableOrder}>
                    {props.enableOrder ? 'Send Order' : 'Save Prescriptions'}
                  </Button>
                </div>
              </Show>
            </Show>
          </PhotonAuthorized>
        </div>
      </div>
    </div>
  );
}

// moving out all of the guts of the component into a separate component so I can wrap the logic in the RecentOrders Provider
customElement(
  'photon-prescribe-workflow',
  {
    patientId: undefined,
    templateIds: undefined,
    templateOverrides: undefined,
    prescriptionIds: undefined,
    hideSubmit: false,
    hideTemplates: true,
    enableOrder: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableMedHistory: false,
    mailOrderIds: undefined,
    pharmacyId: undefined,
    loading: false,
    address: undefined,
    weight: undefined,
    weightUnit: 'lbs',
    triggerSubmit: false,
    setTriggerSubmit: undefined,
    toastBuffer: 0
  },
  (props: PrescribeProps) => {
    const { store, actions } = createFormStore({
      dispenseAsWritten: false,
      patient: undefined,
      treatment: undefined,
      draftPrescriptions: [],
      pharmacy: undefined,
      errors: [],
      address: undefined
    });

    return (
      <RecentOrders patientId={store.patient?.value?.id}>
        <PrescribeWorkflow
          patientId={props.patientId}
          templateIds={props.templateIds}
          templateOverrides={props.templateOverrides}
          prescriptionIds={props.prescriptionIds}
          hideSubmit={props.hideSubmit}
          hideTemplates={props.hideTemplates}
          enableOrder={props.enableOrder}
          enableLocalPickup={props.enableLocalPickup}
          enableSendToPatient={props.enableSendToPatient}
          enableMedHistory={props.enableMedHistory}
          mailOrderIds={props.mailOrderIds}
          pharmacyId={props.pharmacyId}
          loading={props.loading}
          address={props.address}
          weight={props.weight}
          weightUnit={props.weightUnit}
          triggerSubmit={props.triggerSubmit}
          toastBuffer={props.toastBuffer}
          formStore={store}
          formActions={actions}
        />
      </RecentOrders>
    );
  }
);
