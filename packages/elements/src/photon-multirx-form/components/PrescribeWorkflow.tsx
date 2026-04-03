import { gql } from 'graphql-tag';
import { PhotonAuthorized } from '../../photon-authorized';
import type { FormError } from '../../stores/form';
import { checkHasPermission } from '../../utils';
import { AddPrescriptionCard } from './AddPrescriptionCard';
import { DraftPrescriptionCard } from './DraftPrescriptionCard';
import { OrderCard } from './OrderCard';
import { PatientCard } from './PatientCard';
import { PharmacyCard } from './PharmacyCard';
import clearForm from '../util/clearForm';
import { formatPatientWeight } from '../util/formatPatientWeight';
import {
  AddressForm,
  Alert,
  Button,
  RecentOrders,
  ScreeningAlertAcknowledgementDialog,
  ScreeningAlertType,
  SignatureAttestationModal,
  Spinner,
  Toaster,
  triggerToast,
  useDraftPrescriptions,
  usePharmacySelectionContext,
  usePhoton,
  usePrescribeEventDispatch,
  useRecentOrders
} from '@photonhealth/components';
import { MeUserQuery, types } from '@photonhealth/sdk';
import { Prescription, PrescriptionState } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createEffect, createMemo, createSignal, For, onMount, Ref, Show, untrack } from 'solid-js';
import { SupervisorCard } from './SupervisorCard';

const hasUsableAddress = (address?: {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) => {
  if (!address) {
    return false;
  }
  return Boolean(
    address.street1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim()
  );
};

const fulfillmentNeedsAddress = (fulfillmentType?: string) => {
  return (
    fulfillmentType === types.FulfillmentType.PickUp ||
    fulfillmentType === types.FulfillmentType.MailOrder
  );
};

const shouldBlockOrderWithoutAddress = (fulfillmentType?: string, hasAddress?: boolean) => {
  return fulfillmentNeedsAddress(fulfillmentType) && !hasAddress;
};

export type Address = {
  city: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: string;
  country?: string;
};

export interface DisabledItem {
  treatmentIds?: string[];
  reason?: string;
}

export type DisableList = DisabledItem[];

export type PrescribeProps = {
  patientId?: string;
  hideSubmit: boolean;
  hideTemplates: boolean;
  hidePatientCard: boolean;
  enableOrder: boolean;
  enableMedHistory: boolean;
  enableMedHistoryLinks: boolean;
  enableMedHistoryRefillButton: boolean;
  enableCombineAndDuplicate: boolean;
  optionalPatientAddress: boolean;
  address?: Address;
  weight?: number;
  weightUnit?: string;
  additionalNotes?: string;
  triggerSubmit: boolean;
  toastBuffer: number;
  formStore?: any;
  formActions?: any;
  externalOrderId?: string;
  catalogId?: string;
  allowOffCatalogSearch?: boolean;
  disableList?: DisableList;
  groupId?: string;
  initialShowForm: boolean;
};

export const ScreenDraftedPrescriptionsQuery = gql`
  query ScreenDraftedPrescriptionsQuery(
    $draftedPrescriptions: [DraftedPrescriptionInput!]!
    $patientId: ID!
  ) {
    prescriptionScreen(draftedPrescriptions: $draftedPrescriptions, patientId: $patientId) {
      alerts {
        type
        description
        involvedEntities {
          id
          name
          __typename
        }
        severity
      }
    }
  }
`;

const calculateNeedsSupervisor = ({ title, state }: { title?: string; state?: string }) =>
  !!title &&
  !!state &&
  ['NP', 'PA'].includes(title) &&
  ['CA', 'FL', 'GA', 'MI', 'MO', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA'].includes(state.toUpperCase());

export function PrescribeWorkflow(props: PrescribeProps) {
  let ref: Ref<any> | undefined;
  let prescriptionRef: HTMLDivElement | undefined;

  const { draftPrescriptions, prescriptionIds, tryUpdatePrescriptionStates, isLoadingPrefills } =
    useDraftPrescriptions();
  const pharmacySelectionContext = usePharmacySelectionContext();
  const {
    dispatchFormValidate,
    dispatchPrescriptionsCreated,
    dispatchPrescriptionsError,
    dispatchOrderCreated,
    dispatchOrderError,
    dispatchClinicalAlertAcknowledge,
    dispatchClinicalAlertCancel,
    dispatchAnalyticsTrackEvent
  } = usePrescribeEventDispatch();
  const [needsSupervisor, setNeedsSupervisor] = createSignal<boolean>(false);

  const client = usePhoton();
  const [showForm, setShowForm] = createSignal<boolean>(props.initialShowForm);
  const [errors, setErrors] = createSignal<FormError[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const [authenticated, setAuthenticated] = createSignal<boolean>(
    client?.authentication.state.isAuthenticated || false
  );
  const [, recentOrdersActions] = useRecentOrders();
  const [screeningAlerts, setScreeningAlerts] = createSignal<ScreeningAlertType[]>([]);

  const [overrideScreenAlerts, setOverrideScreenAlerts] = createSignal<boolean>(false);

  const hasPatientAddress = createMemo(() => {
    const address = props.formStore?.address?.value ?? props.formStore?.patient?.value?.address;
    return hasUsableAddress(address);
  });
  const hasPreferredPharmacy = createMemo(() => {
    return Boolean(props.formStore?.patient?.value?.preferredPharmacies?.length);
  });

  const forceAddressForm = createMemo(() => {
    if (!props.optionalPatientAddress || !props.enableOrder) {
      return false;
    }
    return (
      fulfillmentNeedsAddress(pharmacySelectionContext.fulfillmentType()) && !hasPatientAddress()
    );
  });
  const [isScreeningAlertWarningOpen, setIsScreeningAlertWarningOpen] = createSignal(false);

  // we can ignore the warnings to put inside of a createEffect, the additionalNotes or weight shouldn't be updating
  let prefillNotes = '';
  if (props.additionalNotes) {
    prefillNotes = `${props.additionalNotes}

`;
  }
  if (props.weight) {
    prefillNotes = `${prefillNotes}${formatPatientWeight(props.weight, props?.weightUnit)}`;
  }

  onMount(async () => {
    if (props.address) {
      // if manually overriding address, update the store on mount
      props.formActions.updateFormValue({
        key: 'address',
        value: props.address
      });
    }

    ref.addEventListener('photon-ticket-created-duplicate', () => {
      // need to reset all the form data
      clearForm(props.formActions, prefillNotes ? { notes: prefillNotes } : undefined);
      pharmacySelectionContext.setFulfillmentType(undefined);
      pharmacySelectionContext.setPharmacyId(undefined);
      pharmacySelectionContext.setUpdatePreferredPharmacy(false);
    });

    const {
      data: { me }
    } = await client.sdk.apolloClinical.query({
      query: MeUserQuery
    });
    const needsSupervisorResult = calculateNeedsSupervisor({
      title: me.name?.title || undefined,
      state: me.address?.state || undefined
    });
    setNeedsSupervisor(needsSupervisorResult);
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

  const hasValidAddress = createMemo(() => {
    const patientAddress =
      props.formStore?.address?.value ?? props.formStore?.patient?.value?.address;
    return patientAddress && patientAddress.street1;
  });

  const addressId = createMemo(() => {
    const patientAddress =
      props.formStore?.address?.value ?? props.formStore?.patient?.value?.address;
    return patientAddress?.id;
  });

  const formattedAddress = createMemo(() => {
    // remove unnecessary fields, and add country and street2 if missing
    const patientAddress =
      props.formStore?.address?.value ?? props.formStore?.patient?.value?.address ?? {};
    const { __typename, name, ...filteredPatientAddress } = patientAddress;
    const address = { street2: '', country: 'US', ...filteredPatientAddress };
    return address;
  });

  const removeDuplicateTreatments = (
    prescriptions: ScreenablePrescription[]
  ): ScreenablePrescription[] => {
    // let's remove any duplicate treatment ids
    // as there's no point to sending up multiple
    // of the same medication
    const seenTreatmentIds = new Set<string>();
    return prescriptions.filter((entity) => {
      const treatmentId = entity.treatment.id;
      if (seenTreatmentIds.has(treatmentId)) {
        return false;
      } else {
        seenTreatmentIds.add(treatmentId);
        return true;
      }
    });
  };

  // let's start screening all of the prescriptions we're drafting
  const screenDraftedPrescriptions = async () => {
    // start out by getting the treatment id of the prescription we're drafting now -
    // we'll want to knwo about it so we cn show an alert underneath it, before it gets
    // added to the order
    const inProgressDraftedPrescriptionTreatmentId = props.formStore.treatment?.value?.id;

    // and then get the ones already added to the order (but not persisted)
    const draftedPrescriptions: ScreenablePrescription[] = draftPrescriptions().map(
      toScreenableDraftPrescription
    );

    // if there is one, add in the prescription being created
    if (inProgressDraftedPrescriptionTreatmentId) {
      draftedPrescriptions.push({
        treatment: { id: inProgressDraftedPrescriptionTreatmentId }
      });
    }
    const dedupedSanitizedPrescriptions = removeDuplicateTreatments(draftedPrescriptions);

    // make the screening request
    const { data } = await clinicalClient.query({
      query: ScreenDraftedPrescriptionsQuery,
      variables: {
        patientId: props.formStore.patient?.value.id,
        draftedPrescriptions: dedupedSanitizedPrescriptions
      }
    });

    setScreeningAlerts(data?.prescriptionScreen?.alerts ?? []);
  };

  createEffect(() => {
    if (draftPrescriptions().length > 0) {
      // if drafted prescriptions gets appended to,
      // such as in the case of re-prescribing from
      // med history, we need to screen the new
      // prescriptions
      screenDraftedPrescriptions();
    }
  });

  const displayAlertsWarning = () => {
    setIsScreeningAlertWarningOpen(true);
  };

  // before submitting the form, show combine dialog if there is a routing order for the patient
  const displayCombineDialog = () => {
    return recentOrdersActions.setIsCombineDialogOpen(
      true,
      () => submitForm(),
      addressId(),
      formattedAddress()
    );
  };

  // submits the form to create a new order
  const submitForm = async () => {
    if (isLoading()) {
      return;
    }
    setErrors([]);
    setOverrideScreenAlerts(false);

    if (!hasPrescribePermission()) {
      return triggerToast({
        status: 'error',
        header: 'Unauthorized',
        body: 'You do not have permission to prescribe'
      });
    }

    if (
      props.enableOrder &&
      shouldBlockOrderWithoutAddress(
        pharmacySelectionContext.fulfillmentType(),
        hasPatientAddress()
      )
    ) {
      setIsLoading(false);
      triggerToast({
        status: 'error',
        header: 'Address required',
        body: 'Please add a patient address to place a local pickup or mail order.'
      });
      setErrors([
        {
          key: 'address',
          error: 'Please enter an address for patient...'
        }
      ]);
      return;
    }

    const requiresAddress =
      props.enableOrder && (!props.optionalPatientAddress || hasPreferredPharmacy());
    const keys = requiresAddress ? ['patient', 'address'] : ['patient'];
    props.formActions.validate(keys);
    const errors = props.formActions.getErrors(keys);
    if (errors.length === 0) {
      setIsLoading(true);
      props.formActions.updateFormValue({
        key: 'errors',
        value: []
      });

      if (props.enableOrder) {
        await sendOrderToApi();
      } else {
        await activatePrescriptionsOnApi();
      }

      // this reflects the prescription state changing from 'draft' to 'active'
      dispatchPrescriptionsCreated(draftPrescriptions());
    } else {
      setErrors(errors);
      dispatchOrderError(errors);
      setIsLoading(false);
      triggerToast({
        status: 'error',
        header: 'Error Creating Order',
        body: 'Please check your order details'
      });
    }
  };

  const activatePrescriptionsOnApi = async () => {
    try {
      await tryUpdatePrescriptionStates(prescriptionIds(), PrescriptionState.Active);
      dispatchAnalyticsTrackEvent('ctaClicked', {
        name: 'Prescriptions Activated',
        buttonText: 'Send',
        prescriptionCount: draftPrescriptions().length
      });
    } catch (err) {
      dispatchPrescriptionsError([err as Error]);
    }
    setIsLoading(false);
  };

  const sendOrderToApi = async () => {
    const orderMutation = client.getSDK().clinical.order.createOrder({});
    const removePatientPreferredPharmacyMutation = client
      .getSDK()
      .clinical.patient.removePatientPreferredPharmacy({});
    const updatePatientMutation = client.getSDK().clinical.patient.updatePatient({});

    try {
      const selectedPharmacyId = pharmacySelectionContext.pharmacyId();

      if (
        pharmacySelectionContext.updatePreferredPharmacy() &&
        selectedPharmacyId &&
        pharmacySelectionContext.fulfillmentType() === 'PICK_UP'
      ) {
        const patient = props.formStore.patient?.value;
        if (patient?.preferredPharmacies && patient?.preferredPharmacies?.length > 0) {
          // remove the current preferred pharmacy
          removePatientPreferredPharmacyMutation({
            variables: {
              patientId: patient.id,
              pharmacyId: patient.preferredPharmacies[0].id
            },
            awaitRefetchQueries: false
          });
        }
        // add the new preferred pharmacy to the patient
        updatePatientMutation({
          variables: {
            id: patient.id,
            preferredPharmacies: [selectedPharmacyId]
          },
          awaitRefetchQueries: false
        });
      }

      // default to auto-routed pharmacy passed in by customer using
      // elements embed or determined based on routing constraints
      let pharmacyId = pharmacySelectionContext.autoRoutedPharmacyId();
      if (selectedPharmacyId) {
        // use selected pharmacy if available
        pharmacyId = selectedPharmacyId;
      }
      if (!pharmacyId) {
        // api does not allow null/undefined
        pharmacyId = '';
      }

      const supervisorId =
        needsSupervisor() && props.formStore.supervisorId?.value
          ? props.formStore.supervisorId.value
          : undefined;

      const { data: orderData, errors } = await orderMutation({
        variables: {
          ...(props.externalOrderId ? { externalId: props.externalOrderId } : {}),
          ...(props.groupId ? { groupId: props.groupId } : {}),
          patientId: props.formStore.patient?.value.id,
          pharmacyId,
          fulfillmentType: pharmacySelectionContext.fulfillmentType() || '',
          ...(addressId()
            ? { addressId: addressId() }
            : hasValidAddress()
            ? { address: formattedAddress() }
            : {}),
          fills: prescriptionIds().map((id) => ({
            prescriptionId: id
          })),
          supervisorId: supervisorId
        },
        refetchQueries: [],
        awaitRefetchQueries: false
      });

      setIsLoading(false);
      if (errors) {
        dispatchOrderError(errors);
        return;
      }
      dispatchOrderCreated(orderData!.createOrder);
      dispatchAnalyticsTrackEvent('ctaClicked', {
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: orderData!.createOrder.id,
        prescriptionCount: draftPrescriptions().length,
        fulfillmentType: pharmacySelectionContext.fulfillmentType() || 'SEND_TO_PATIENT',
        hasPreferredPharmacy: hasPreferredPharmacy(),
        setAsPreferred: pharmacySelectionContext.updatePreferredPharmacy(),
        pharmacyId: pharmacyId || null,
        isCombinedOrder: false
      });
    } catch (err) {
      dispatchOrderError([err as GraphQLFormattedError]);
      setIsLoading(false);
      triggerToast({
        status: 'error',
        header: 'Error Creating Order',
        body: (err as GraphQLFormattedError)?.message
      });
    }
  };

  // decide whether to show the combine modal or submit the form
  const combineOrSubmit = () => {
    // if we have alerts we'll want the prescriber to acknowledge them
    // first, unless we're overriding them
    if (screeningAlerts().length > 0 && overrideScreenAlerts() === false) {
      return displayAlertsWarning();
    }

    if (props.enableCombineAndDuplicate && recentOrdersActions.hasRoutingOrder()) {
      return displayCombineDialog();
    }

    return submitForm();
  };

  createEffect(() => {
    if (props.triggerSubmit) {
      untrack(() => combineOrSubmit());
    }
  });

  createEffect(() => {
    dispatchFormValidate(
      Boolean(draftPrescriptions().length > 0 && props.formStore.patient?.value),
      props.formStore
    );
  });

  const clinicalClient = client.sdk.apolloClinical;

  const hasCorrectPatientData = createMemo(() => {
    return (
      !props.patientId ||
      props.patientId === props.formStore.patient?.value?.id ||
      props.patientId === props.formStore.patient?.value?.externalId
    );
  });

  const handleDraftPrescriptionCreated = () => {
    if (isEditing()) {
      setIsEditing(false);
    }
  };

  return (
    <div ref={ref}>
      <Show
        when={
          isScreeningAlertWarningOpen() && screeningAlerts().length > 0 && !overrideScreenAlerts()
        }
      >
        <ScreeningAlertAcknowledgementDialog
          alerts={screeningAlerts()}
          isOpen={isScreeningAlertWarningOpen()}
          onIgnoreWarningAndCreateAnyway={() => {
            setIsLoading(false);
            // if this button is clicked
            // we'll want to ignore any warnings
            // and create the orders/prescriptions
            // regardless of the presence of alerts
            setOverrideScreenAlerts(true);
            setIsScreeningAlertWarningOpen(false);
            combineOrSubmit();
            dispatchClinicalAlertAcknowledge(screeningAlerts());
            dispatchAnalyticsTrackEvent('ctaClicked', {
              name: 'Screening Alert Acknowledged',
              screeningAlertCount: screeningAlerts().length,
              buttonText: 'Send'
            });
          }}
          onRevisitPrescriptions={() => {
            setIsLoading(false);
            setIsScreeningAlertWarningOpen(false);
            dispatchClinicalAlertCancel(screeningAlerts());
            dispatchAnalyticsTrackEvent('ctaClicked', {
              name: 'Screening Alert Canceled',
              screeningAlertCount: screeningAlerts().length,
              buttonText: 'Cancel'
            });
          }}
        />
      </Show>

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
                  message="You have access to see the form but you will not be able to submit any prescriptions."
                />
              </Show>
              <PatientCard
                actions={props.formActions}
                store={props.formStore}
                patientId={props.patientId}
                client={client}
                enableOrder={props.enableOrder}
                address={props.address}
                weight={props.weight}
                weightUnit={props.weightUnit}
                enableMedHistory={props.enableMedHistory}
                enableMedHistoryLinks={props.enableMedHistoryLinks ?? false}
                enableMedHistoryRefillButton={props.enableMedHistoryRefillButton ?? false}
                hidePatientCard={props.hidePatientCard}
                optionalPatientAddress={props.optionalPatientAddress}
              />
              <Show
                when={
                  // if patientId is passed in, we need to ensure it matches the patient id in our store
                  // so we are not referencing stale data
                  hasCorrectPatientData() &&
                  // if orders are enabled, we need a patient's address (unless address is optional)
                  (props.formStore.patient?.value?.address ||
                    // if orders are disabled, we need only a patient id
                    (props.formStore.patient?.value?.id && !props.enableOrder) ||
                    // optionalpatientaddress skips address requirement unless a preferred pharmacy is set
                    (props.formStore.patient?.value?.id &&
                      props.optionalPatientAddress &&
                      !hasPreferredPharmacy()))
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
                      screenDraftedPrescriptions={function () {
                        screenDraftedPrescriptions();
                      }}
                      draftedPrescriptionChanged={function () {
                        screenDraftedPrescriptions();
                      }}
                      onDraftPrescriptionCreated={handleDraftPrescriptionCreated}
                      screeningAlerts={screeningAlerts()}
                      catalogId={props.catalogId}
                      allowOffCatalogSearch={props.allowOffCatalogSearch}
                      disableList={props.disableList}
                    />
                  </div>
                </Show>
                <DraftPrescriptionCard
                  prescriptionRef={prescriptionRef}
                  actions={props.formActions}
                  store={props.formStore}
                  setIsEditing={setIsEditing}
                  handleDraftPrescriptionsChange={function () {
                    screenDraftedPrescriptions();
                  }}
                  screeningAlerts={screeningAlerts()}
                  routingConstraints={pharmacySelectionContext.routingConstraints()}
                  enableOrder={props.enableOrder}
                />
                <Show when={props.enableOrder && needsSupervisor()}>
                  <SupervisorCard actions={props.formActions} store={props.formStore} />
                </Show>
                <Show when={props.enableOrder && !pharmacySelectionContext.isAutoRouted()}>
                  <OrderCard store={props.formStore} />
                </Show>
                <Show when={forceAddressForm() && props.formStore.patient?.value?.id}>
                  <AddressForm
                    patientId={props.formStore.patient?.value?.id}
                    showRequiredBanner={false}
                    openStateDropdownUpward={true}
                    setAddress={(address: Address) => {
                      props.formActions.updateFormValue({
                        key: 'address',
                        value: address
                      });
                      props.formActions.updateFormValue({
                        key: 'patient',
                        value: {
                          ...props.formStore.patient!.value,
                          address
                        }
                      });
                    }}
                  />
                </Show>
                <Show when={props.enableOrder && pharmacySelectionContext.isAutoRouted()}>
                  <PharmacyCard pharmacyId={pharmacySelectionContext.autoRoutedPharmacyId()} />
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
                    <Button loading={isLoadingPrefills() || isLoading()} onClick={combineOrSubmit}>
                      Send
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

type ScreenablePrescription = {
  dispenseAsWritten?: boolean;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  daysSupply?: number;
  instructions?: string;
  notes?: string;
  effectiveDate?: string;
  treatment: {
    id: string;
  };
};

const toScreenableDraftPrescription = (prescription: Prescription): ScreenablePrescription => {
  return {
    dispenseAsWritten: prescription.dispenseAsWritten || undefined,
    dispenseQuantity: prescription.dispenseQuantity,
    dispenseUnit: prescription.dispenseUnit,
    fillsAllowed: prescription.fillsAllowed,
    daysSupply: prescription.daysSupply || undefined,
    instructions: prescription.instructions,
    notes: prescription.notes || undefined,
    // TODO: is effectiveDate needed to screen prescription?
    effectiveDate: prescription.effectiveDate,
    treatment: {
      id: prescription.treatment.id
    }
  };
};
