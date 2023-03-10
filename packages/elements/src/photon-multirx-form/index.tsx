import { customElement } from 'solid-element';

//Shoelace Components
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import { createFormStore } from '../stores/form';
import { usePhoton } from '../context';
import { Order, Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { AddPrescriptionCard } from './components/AddPrescriptionCard';
import { PatientCard } from './components/PatientCard';
import { DraftPrescriptionCard } from './components/DraftPrescriptionCard';
import { GraphQLError } from 'graphql';
import { OrderCard } from './components/OrderCard';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import { PharmacyCard } from './components/PharmacyCard';
import { PhotonAuthorized } from '../photon-authorized';

const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFields on Catalog {
    id
    treatments {
      id
      name
    }
    templates {
      id
      daysSupply
      dispenseAsWritten
      dispenseQuantity
      dispenseUnit
      instructions
      notes
      fillsAllowed
      treatment {
        id
        name
      }
    }
  }
`;

customElement(
  'photon-prescribe-workflow',
  {
    patientId: undefined,
    templateIds: undefined,
    hideSubmit: false,
    hideTemplates: true,
    enableOrder: false,
    pharmacyId: undefined,
    loading: false
  },
  (
    props: {
      patientId?: string;
      templateIds?: string;
      hideSubmit: boolean;
      hideTemplates: boolean;
      enableOrder: boolean;
      pharmacyId?: string;
      loading: boolean;
    },
    options
  ) => {
    let ref: any;
    const { store, actions } = createFormStore({
      dispenseAsWritten: false,
      patient: undefined,
      treatment: undefined,
      draftPrescriptions: [],
      pharmacy: undefined,
      errors: [],
      address: undefined
    });
    const client = usePhoton();
    const [showForm, setShowForm] = createSignal<boolean>(!props.templateIds);
    const [isLoading, setIsLoading] = createSignal<boolean>(true);
    const [isLoadingTemplates, setIsLoadingTemplates] = createSignal<boolean>(false);
    const [authenticated, setAuthenticated] = createSignal<boolean>(
      client?.authentication.state.isAuthenticated || false
    );

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
    }, [client?.authentication.state.isLoading]);
    createEffect(() => {
      setAuthenticated(client?.authentication.state.isAuthenticated || false);
    }, [client?.authentication.state.isAuthenticated]);

    createEffect(async () => {
      if (props.templateIds && client) {
        setIsLoadingTemplates(true);
        const ids = props.templateIds.split(',');

        // TODO: Should just get the template directly but not supported by the SDK
        const {
          data: { catalogs }
        } = await client!.getSDK().clinical.catalog.getCatalogs();
        if (catalogs.length === 0) {
          console.error('No catalog set');
          return;
        }
        const {
          data: { catalog }
        } = await client!.getSDK().clinical.catalog.getCatalog({
          id: catalogs[0].id,
          fragment: {
            CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
          }
        });
        // Build a map for easy lookup
        const templateMap: { [key: string]: PrescriptionTemplate } = {};
        catalog.templates.forEach((template) => {
          if (template) templateMap[template.id] = template;
        });
        for (let i = 0; i < ids.length; i++) {
          const templateId = ids[i];
          const template = templateMap[templateId];
          if (!template) {
            console.error(`Invalid template id ${templateId}`);
          }
          if (
            // minimum template fields required to create a prescription
            !template.treatment ||
            !template.dispenseQuantity ||
            !template.dispenseUnit ||
            !template.fillsAllowed ||
            !template.instructions
          ) {
            console.error(`Template is missing required prescription details ${templateId}`);
          }
          actions.updateFormValue({
            key: 'draftPrescriptions',
            value: [
              ...(store['draftPrescriptions']?.value || []),
              {
                id: String(Math.random()),
                effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
                treatment: template.treatment,
                dispenseAsWritten: template.dispenseAsWritten,
                dispenseQuantity: template.dispenseQuantity,
                dispenseUnit: template.dispenseUnit,
                daysSupply: template.daysSupply,
                // when we pre-populate draft prescriptions using template ID's, we need need to update the value for refills here
                refillsInput: template.fillsAllowed ? template.fillsAllowed - 1 : 0,
                fillsAllowed: template.fillsAllowed,
                instructions: template.instructions,
                notes: template.notes,
                addToTemplates: false,
                catalogId: undefined
              }
            ]
          });
        }
        setIsLoadingTemplates(false);
      }
    }, [client]);

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

    const dispatchOrderError = (errors: readonly GraphQLError[]) => {
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
          form: store,
          actions: actions
        }
      });
      ref?.dispatchEvent(event);
    };

    const submitForm = async (enableOrder: boolean) => {
      const keys = enableOrder
        ? ['patient', 'draftPrescriptions', 'pharmacy', 'address']
        : ['patient', 'draftPrescriptions'];
      actions.validate(keys);
      const errorsPresent = actions.hasErrors(keys);
      if (!errorsPresent) {
        setIsLoading(true);
        actions.updateFormValue({
          key: 'errors',
          value: []
        });
        const orderMutation = client!.getSDK().clinical.order.createOrder({});
        const rxMutation = client!.getSDK().clinical.prescription.createPrescriptions({});
        const prescriptions = [];
        for (const draft of store['draftPrescriptions']!.value) {
          const args = {
            daysSupply: draft.daysSupply,
            dispenseAsWritten: draft.dispenseAsWritten,
            dispenseQuantity: draft.dispenseQuantity,
            dispenseUnit: draft.dispenseUnit,
            effectiveDate: draft.effectiveDate,
            instructions: draft.instructions,
            notes: draft.notes,
            patientId: store['patient']?.value.id,
            // +1 here because we're using the refillsInput
            fillsAllowed: draft.refillsInput ? draft.refillsInput + 1 : 1,
            treatmentId: draft.treatment.id
          };
          prescriptions.push(args);
        }
        const { data, errors } = await rxMutation({
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
        dispatchPrescriptionsCreated(data!.createPrescriptions);
        if (props.enableOrder) {
          const address = Object.assign({}, store['patient']?.value.address);
          delete address['__typename'];
          delete address['name'];
          const { data: data2, errors } = await orderMutation({
            variables: {
              patientId: store['patient']?.value.id,
              pharmacyId: props?.pharmacyId || store['pharmacy']?.value.id,
              address: address,
              fills: data?.createPrescriptions.map((x) => ({ prescriptionId: x.id }))
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
          dispatchOrderCreated(data2!.createOrder);
        }
      }
    };

    options.element['submitForm'] = submitForm;

    createEffect(() => {
      dispatchPrescriptionsFormValidate(
        Boolean(store['draftPrescriptions']?.value?.length > 0 && store['patient']?.value)
      );
    });

    let prescriptionRef: HTMLDivElement | undefined;

    return (
      <div ref={ref}>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <style>{styles}</style>
        <div>
          <div class="flex flex-col gap-8">
            <Show when={(!client || isLoading()) && !authenticated()}>
              <div class="w-full flex justify-center">
                <sl-spinner style="font-size: 3rem;"></sl-spinner>
              </div>
            </Show>
            <PhotonAuthorized permissions={['write:prescription']}>
              <PatientCard
                actions={actions}
                store={store}
                patientId={props.patientId}
                client={client!}
                enableOrder={props.enableOrder}
              ></PatientCard>
              <Show when={showForm()}>
                <div ref={prescriptionRef}>
                  <AddPrescriptionCard
                    hideAddToTemplates={props.hideTemplates}
                    actions={actions}
                    store={store}
                  ></AddPrescriptionCard>
                </div>
              </Show>
              <DraftPrescriptionCard
                prescriptionRef={prescriptionRef}
                actions={actions}
                store={store}
                isLoading={isLoadingTemplates()}
              ></DraftPrescriptionCard>
              <Show when={props.enableOrder && !props.pharmacyId}>
                <OrderCard store={store} actions={actions}></OrderCard>
              </Show>
              <Show when={props.enableOrder && props.pharmacyId}>
                <PharmacyCard pharmacyId={props.pharmacyId}></PharmacyCard>
              </Show>
              <Show when={!props.hideSubmit}>
                <div class="flex flex-row justify-end gap-2">
                  <Show when={!showForm()}>
                    <photon-button
                      class="w-full xs:w-fit"
                      variant="outline"
                      on:photon-clicked={async () => setShowForm(true)}
                    >
                      {'Add Prescription'}
                    </photon-button>
                  </Show>
                  <photon-button
                    class="w-full xs:w-fit"
                    loading={isLoading()}
                    on:photon-clicked={async () => await submitForm(props.enableOrder)}
                  >
                    {props.enableOrder ? 'Send Order' : 'Save Prescriptions'}
                  </photon-button>
                </div>
              </Show>
            </PhotonAuthorized>
          </div>
        </div>
      </div>
    );
  }
);
