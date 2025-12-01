import { customElement } from 'solid-element';
import { createSignal, Show } from 'solid-js';
import { Button, usePhoton } from '@photonhealth/components';
import { PhotonFormWrapper } from '../photon-form-wrapper';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

type PatientDialogProps = {
  patientId: string;
  open: boolean;
  hideCreatePrescription: boolean;
};

const Component = (props: PatientDialogProps) => {
  let ref: any;
  const client = usePhoton();
  const [loading, setLoading] = createSignal(false);
  const [isCreatePrescription, setIsCreatePrescription] = createSignal<boolean>(false);
  const [formStore, setFormStore] = createSignal<any>(undefined);
  const [selectedStore, setSelectedStore] = createSignal<any>(undefined);
  const [actions, setActions] = createSignal<any>(undefined);
  const [globalError, setGlobalError] = createSignal<string | undefined>(undefined);

  const dispatchUpdate = (patientId: string, createPrescription = false) => {
    const event = new CustomEvent('photon-patient-updated', {
      composed: true,
      bubbles: true,
      detail: {
        patientId: patientId,
        createPrescription
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchCreated = (patientId: string, createPrescription = false) => {
    const event = new CustomEvent('photon-patient-created', {
      composed: true,
      bubbles: true,
      detail: {
        patientId: patientId,
        createPrescription
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchClosed = () => {
    const event = new CustomEvent('photon-patient-closed', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const submitForm = async (store: any, actions: any, pStore: any, createPrescription = false) => {
    setGlobalError(undefined);
    setIsCreatePrescription(createPrescription);
    setLoading(true);
    const keys = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'phone',
      'sex',
      'email',
      'address_street1',
      'address_city',
      'address_state',
      'address_zip'
    ];

    actions.validate(keys);
    if (actions.hasErrors(keys)) {
      setLoading(false);
      return true;
    }

    if (
      store['preferredPharmacy']!.value &&
      pStore.selectedPatient.data?.preferredPharmacies &&
      pStore.selectedPatient.data?.preferredPharmacies.length !== 0 &&
      !pStore.selectedPatient.data?.preferredPharmacies
        ?.map((x: any) => x?.id)
        .filter((x: any) => x !== null)
        .includes(store['preferredPharmacy']!.value)
    ) {
      // remove existing preferred pharmacy in order to add the new one
      const removePreferredPharmacyMutation = client!
        .getSDK()
        .clinical.patient.removePatientPreferredPharmacy({});
      await removePreferredPharmacyMutation({
        variables: {
          patientId: props.patientId,
          pharmacyId: pStore.selectedPatient.data?.preferredPharmacies![0]!.id
        },
        awaitRefetchQueries: false
      });
    }

    const patientData = {
      ...(props?.patientId ? { id: props.patientId } : {}),
      name: {
        first: store['firstName']!.value,
        last: store['lastName']!.value
      },
      gender: store['gender']!.value,
      email: store['email']!.value ? store['email']!.value : undefined,
      phone: store['phone']!.value,
      dateOfBirth: store['dateOfBirth']!.value,
      sex: store['sex']!.value,
      address:
        store['address_street1']!.value !== undefined
          ? {
              street1: store['address_street1']!.value,
              street2: store['address_street2']!.value,
              city: store['address_city']!.value,
              state: store['address_state']!.value,
              postalCode: store['address_zip']!.value,
              country: 'US'
            }
          : undefined,
      preferredPharmacies: store['preferredPharmacy']!.value
        ? [store['preferredPharmacy']!.value]
        : []
    };
    try {
      if (props?.patientId) {
        // if patientId is provided, update the patient.
        const updatePatientMutation = client!.getSDK().clinical.patient.updatePatient({});
        await updatePatientMutation({ variables: patientData, awaitRefetchQueries: false });
        dispatchUpdate(props.patientId, createPrescription);
      } else {
        // otherwise, create a new patient
        const createPatientMutation = client!.getSDK().clinical.patient.createPatient({});
        const patient = await createPatientMutation({
          variables: patientData,
          awaitRefetchQueries: false
        });
        dispatchCreated(patient?.data?.createPatient?.id || '', createPrescription);
      }
      setLoading(false);
      actions.resetStores();
      props.open = false;
    } catch (e: any) {
      setLoading(false);
      setGlobalError(e?.message || 'An error occurred while saving the patient.');
    }
  };

  return (
    <div ref={ref}>
      <style>{photonStyles}</style>
      <Show when={props.open}>
        <PhotonFormWrapper
          onClosed={() => {
            dispatchClosed();
            actions().resetStores();
            props.open = false;
          }}
          title={props?.patientId ? 'Update patient' : 'New patient'}
          titleIconName={props?.patientId ? 'pencil-square' : 'person-plus'}
          footer={
            <>
              <Show when={!props?.hideCreatePrescription}>
                <Button
                  class="w-full xs:w-fit"
                  size="lg"
                  disabled={loading()}
                  loading={loading() && isCreatePrescription()}
                  onClick={() => submitForm(formStore(), actions(), selectedStore(), true)}
                >
                  {props?.patientId ? 'Update' : 'Create'} and start prescription
                </Button>
              </Show>
              <Button
                class="w-full xs:w-fit"
                size="lg"
                variant={props?.hideCreatePrescription ? 'primary' : 'secondary'}
                disabled={loading()}
                loading={loading() && !isCreatePrescription()}
                onClick={() => submitForm(formStore(), actions(), selectedStore(), false)}
              >
                {props?.patientId ? 'Update' : 'Create'} patient
              </Button>
            </>
          }
          form={
            <>
              <Show when={globalError()}>
                <div
                  class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span class="block sm:inline">{globalError()}</span>
                </div>
              </Show>
              <photon-patient-form
                slot="form"
                on:photon-form-updated={(e: any) => {
                  setFormStore(e.detail.form);
                  setActions(Object.assign({}, e.detail.actions, { resetStores: e.detail.reset }));
                  setSelectedStore(e.detail.selected);
                }}
                patient-id={props.patientId}
              />
            </>
          }
        />
      </Show>
    </div>
  );
};
customElement(
  'photon-patient-dialog',
  {
    patientId: '',
    hideCreatePrescription: false,
    open: false
  },
  Component
);
