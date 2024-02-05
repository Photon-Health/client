import { Button } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { customElement } from 'solid-element';
import { createEffect, createSignal, Show } from 'solid-js';
import { size, string } from 'superstruct';
import PhotonFormWrapper from '../photon-form-wrapper';
import { usePhotonWrapper } from '../store-context';
import { createFormStore } from '../stores/form';
import { PatientStore } from '../stores/patient';
import { message } from '../validators';

type PatientDialogProps = {
  patientId: string;
  open: boolean;
  hideCreatePrescription: boolean;
};

customElement(
  'photon-patient-dialog',
  {
    patientId: '',
    hideCreatePrescription: false,
    open: false
  },
  (props: PatientDialogProps) => {
    let ref: any;
    const photon = usePhotonWrapper();
    if (!photon) {
      console.error(
        '[photon-patient-dialog] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-photon element'
      );
      return (
        <div>
          [photon-patient-dialog] No valid PhotonClient instance was provided. Please ensure you are
          wrapping the element in a photon-photon element
        </div>
      );
    }

    const sdk = photon().getSDK();
    const [isOpen, setIsOpen] = createSignal(props.open);
    createEffect(() => setIsOpen(props.open));
    const [loading, setLoading] = createSignal(false);
    const [isCreatePrescription, setIsCreatePrescription] = createSignal<boolean>(false);
    const [formStore, setFormStore] = createSignal<ReturnType<typeof createFormStore>>();
    const [selectedStore, setSelectedStore] = createSignal<(typeof PatientStore)['store']>();

    const [actions, setActions] = createSignal<
      ReturnType<typeof createFormStore>['actions'] & { resetStores: () => void }
    >();
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

    const submitForm = async (
      store: any,
      actions: any,
      pStore: any,
      createPrescription = false
    ) => {
      setGlobalError(undefined);
      setIsCreatePrescription(createPrescription);
      setLoading(true);
      let keys: string[] = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'sex', 'email'];

      if (
        store['address_street1']?.value !== undefined ||
        store['address_city']?.value !== undefined ||
        store['address_state']?.value !== undefined ||
        store['address_zip']?.value !== undefined
      ) {
        actions.registerValidator({
          key: 'address_street1',
          validator: message(size(string(), 1, Infinity), 'Please enter a valid Street 1..')
        });
        actions.registerValidator({
          key: 'address_city',
          validator: message(size(string(), 1, Infinity), 'Please enter a valid City..')
        });
        actions.registerValidator({
          key: 'address_state',
          validator: message(size(string(), 2, 2), 'Please enter a valid State..')
        });
        keys = [...keys, 'address_zip', 'address_street1', 'address_city', 'address_state'];
      } else {
        const keysToRemove = ['address_street1', 'address_city', 'address_state'];
        for (const key of keysToRemove) {
          actions.unRegisterValidator(key);
        }
      }

      actions.validate(keys);
      if (actions.hasErrors(keys)) {
        setLoading(false);
        return true;
      }

      if (
        store['preferredPharmacy']?.value &&
        pStore.selectedPatient.data?.preferredPharmacies &&
        pStore.selectedPatient.data?.preferredPharmacies.length !== 0 &&
        !pStore.selectedPatient.data?.preferredPharmacies
          ?.map((x: any) => x?.id)
          .filter((x: any) => x !== null)
          .includes(store['preferredPharmacy']!.value)
      ) {
        // remove existing preferred pharmacy in order to add the new one
        const removePreferredPharmacyMutation = sdk.clinical.patient.removePatientPreferredPharmacy(
          {}
        );
        const pharmacyId: string = pStore.selectedPatient.data?.preferredPharmacies[0]?.id;
        await removePreferredPharmacyMutation({
          variables: {
            patientId: props.patientId,
            pharmacyId
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
        email: store['email']!.value,
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
          const updatePatientMutation = sdk.clinical.patient.updatePatient({});
          await updatePatientMutation({ variables: patientData, awaitRefetchQueries: false });
          dispatchUpdate(props.patientId, createPrescription);
        } else {
          // otherwise, create a new patient
          const createPatientMutation = sdk.clinical.patient.createPatient({});
          const patient = await createPatientMutation({
            variables: patientData,
            awaitRefetchQueries: false
          });
          dispatchCreated(patient?.data?.createPatient?.id || '', createPrescription);
        }
        setLoading(false);
        actions.resetStores();
        setIsOpen(false);
      } catch (e: any) {
        setLoading(false);
        setGlobalError(e?.message || 'An error occurred while saving the patient.');
      }
    };

    return (
      <div ref={ref}>
        <style>{photonStyles}</style>
        <Show when={isOpen()}>
          <PhotonFormWrapper
            onClosed={() => {
              dispatchClosed();
              actions()?.resetStores();
              setIsOpen(false);
            }}
            title={props?.patientId ? 'Update Patient' : 'Create Patient'}
            titleIconName={props?.patientId ? 'pencil-square' : 'person-plus'}
            headerRight={
              <div class="flex flex-row gap-1 lg:gap-2 justify-end items-end">
                <Show when={!props?.hideCreatePrescription}>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loading()}
                    loading={loading() && isCreatePrescription()}
                    onClick={() => submitForm(formStore(), actions(), selectedStore(), true)}
                  >
                    Save and Create Prescription
                  </Button>
                </Show>
                <Button
                  size="sm"
                  disabled={loading()}
                  loading={loading() && !isCreatePrescription()}
                  onClick={() => submitForm(formStore(), actions(), selectedStore(), false)}
                >
                  Save
                </Button>
              </div>
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
                    setActions(
                      Object.assign({}, e.detail.actions, { resetStores: e.detail.reset })
                    );
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
  }
);
