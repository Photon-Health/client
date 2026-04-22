import { customElement } from 'solid-element';
import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  buildFieldSnapshot,
  Button,
  dispatchAnalyticsTrackEvent,
  PATIENT_FORM_FIELDS,
  PharmacyOption,
  triggerToast,
  usePhoton
} from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';
import { PhotonFormWrapper } from '../PhotonFormWrapper';
import { createFormStore } from '../stores/form';
import gql from 'graphql-tag';
import { PatientForm } from './PatientForm';
import { Patient } from '@photonhealth/sdk/dist/types';

const HAS_PATIENTS_FIELDS = gql`
  fragment PatientFields on Patient {
    id
  }
`;

const PATIENT_DIALOG_FIELDS = gql`
  fragment PatientDialogFields on Patient {
    id
    name {
      first
      last
    }
    dateOfBirth
    sex
    gender
    email
    phone
    address {
      id
      street1
      street2
      city
      state
      postalCode
      country
    }
    preferredPharmacies {
      id
      name
      address {
        city
        country
        postalCode
        state
        street1
        street2
      }
      phone
    }
  }
`;

const patientToFormValues = (patient: Patient | undefined) => ({
  firstName: patient?.name.first,
  lastName: patient?.name.last,
  dateOfBirth: patient?.dateOfBirth,
  sex: patient?.sex,
  gender: patient?.gender,
  phone: patient?.phone,
  email: patient?.email,
  address_street1: patient?.address?.street1,
  address_street2: patient?.address?.street2,
  address_city: patient?.address?.city,
  address_state: patient?.address?.state,
  address_zip: patient?.address?.postalCode,
  preferredPharmacy: patient?.preferredPharmacies?.[0]?.id
});

const Component = (props: {
  patientId: string;
  open: boolean;
  hideCreatePrescription: boolean;
  optionalPatientAddress: boolean;
}) => {
  let ref: any;
  const client = usePhoton();
  const [loading, setLoading] = createSignal(false);
  const [loadingPatient, setLoadingPatient] = createSignal(!!props.patientId);
  const [isCreatePrescription, setIsCreatePrescription] = createSignal<boolean>(false);
  const [globalError, setGlobalError] = createSignal<string | undefined>(undefined);
  const [hasPatients, setHasPatients] = createSignal<boolean>(false);
  const [initialPreferredPharmacy, setInitialPreferredPharmacy] = createSignal<
    PharmacyOption | undefined
  >(undefined);
  const { store, actions } = createFormStore();

  onMount(async () => {
    try {
      const { data } = await client.sdk.clinical.patient.getPatients({
        fragment: { PatientFields: HAS_PATIENTS_FIELDS }
      });
      setHasPatients(data && data.patients.length > 0);
    } catch (err) {
      console.log(err);
      // We don't want this request failing to cause the entire component to throw
    }
  });

  createEffect(async () => {
    const patientId = props.patientId;
    console.log('step 1', patientId);

    if (!patientId) {
      // Clear form if no patient
      const values = patientToFormValues(undefined);
      for (const [key, value] of Object.entries(values)) {
        actions.updateFormValue({ key, value });
      }
      return;
    }

    setLoadingPatient(true);
    try {
      const { data, errors } = await client.sdk.clinical.patient.getPatient({
        id: patientId,
        fragment: {
          PatientDialogFields: PATIENT_DIALOG_FIELDS
        }
      });

      console.log('step 2', data);
      console.log('step 3', errors);

      if (errors || !data?.patient) {
        triggerToast({
          status: 'error',
          body: 'Error loading patient, please close the form and try again'
        });
        return;
      }

      const values = patientToFormValues(data.patient);
      for (const [key, value] of Object.entries(values)) {
        actions.updateFormValue({ key, value });
      }

      const pref = data.patient.preferredPharmacies?.[0];
      if (pref) {
        setInitialPreferredPharmacy({
          ...pref,
          address: pref.address as PharmacyOption['address'],
          isPrevious: true,
          isPreferred: true
        });
      }
    } finally {
      setLoadingPatient(false);
    }
  });

  const hasAnyAddressField = createMemo(
    () =>
      !!(
        store['address_street1']?.value ||
        store['address_street2']?.value ||
        store['address_city']?.value ||
        store['address_state']?.value ||
        store['address_zip']?.value
      )
  );

  const dispatchUpdate = (patientId: string, didClickCreatePatientAndPrescription = false) => {
    const event = new CustomEvent('photon-patient-updated', {
      composed: true,
      bubbles: true,
      detail: {
        patientId: patientId,
        didClickCreatePatientAndPrescription
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

  createEffect(() => {
    if (props.open) {
      dispatchAnalyticsTrackEvent(
        'pageViewed',
        {
          name: props.patientId ? 'Update Patient Page Viewed' : 'New Patient Page Viewed'
        },
        ref
      );
    }
  });

  const submitForm = async (didClickCreatePatientAndPrescription = false) => {
    setGlobalError(undefined);
    setIsCreatePrescription(didClickCreatePatientAndPrescription);
    setLoading(true);

    // Base keys that are always required
    const baseKeys = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'sex', 'email'];

    // Address keys - only validate if address is required OR if any address field has been filled
    const addressKeys = ['address_street1', 'address_city', 'address_state', 'address_zip'];

    // If address is optional and no address fields are filled, skip address validation
    const shouldValidateAddress = !props.optionalPatientAddress || hasAnyAddressField();
    const keys = shouldValidateAddress ? [...baseKeys, ...addressKeys] : baseKeys;

    actions.validate(keys);
    if (actions.hasErrors(keys)) {
      setLoading(false);
      return true;
    }

    const initialPharmacy = initialPreferredPharmacy();
    if (
      store['preferredPharmacy']!.value &&
      initialPharmacy &&
      initialPharmacy.id !== store['preferredPharmacy']!.value
    ) {
      // remove existing preferred pharmacy in order to add the new one
      const removePreferredPharmacyMutation = client!
        .getSDK()
        .clinical.patient.removePatientPreferredPharmacy({});
      await removePreferredPharmacyMutation({
        variables: {
          patientId: props.patientId,
          pharmacyId: initialPharmacy.id
        },
        awaitRefetchQueries: false
      });
    }

    const includeAddress = shouldValidateAddress;
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
      address: includeAddress
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
        dispatchUpdate(props.patientId, didClickCreatePatientAndPrescription);
        dispatchAnalyticsTrackEvent(
          'ctaClicked',
          {
            name: 'Patient Updated',
            buttonText: didClickCreatePatientAndPrescription
              ? 'Update and Start Prescription'
              : 'Update',
            patientId: props.patientId,
            didClickCreatePatientAndPrescription,
            fields: buildFieldSnapshot(store, PATIENT_FORM_FIELDS)
          },
          ref
        );
      } else {
        // otherwise, create a new patient
        const createPatientMutation = client!.getSDK().clinical.patient.createPatient({});
        const patient = await createPatientMutation({
          variables: patientData,
          awaitRefetchQueries: false
        });
        const patientId = patient?.data?.createPatient?.id || '';
        dispatchCreated(patientId, didClickCreatePatientAndPrescription);
        dispatchAnalyticsTrackEvent(
          'ctaClicked',
          {
            name: 'Patient Created',
            buttonText: didClickCreatePatientAndPrescription
              ? 'Create and Start Prescription'
              : 'Create',
            patientId,
            didClickCreatePatientAndPrescription,
            fields: buildFieldSnapshot(store, PATIENT_FORM_FIELDS)
          },
          ref
        );
      }
      setLoading(false);
      actions.reset();
      // TODO: see if we can avoid this
      props.open = false;
    } catch (e: any) {
      setLoading(false);
      setGlobalError(e?.message || 'An error occurred while saving the patient.');
    }
  };

  return (
    <div ref={ref}>
      <Show when={props.open}>
        {/*
          Portal to document.body so the wrapper escapes the prescribe workflow's
          <main overflow-y-auto> scroll container. On iOS, a nested position:fixed
          element inside an overflow:auto ancestor can be clipped to that ancestor,
          leaving the prescribe footer visible through this dialog. useShadow scopes
          photonStyles + the wrapper's Tailwind so they don't leak to document.body.
        */}
        <Portal mount={document.body} useShadow={true}>
          <style>{tailwind}</style>
          <PhotonFormWrapper
            onClosed={() => {
              dispatchClosed();
              props.open = false;
            }}
            title={props?.patientId ? 'Edit patient' : 'New patient'}
            titleIconName={props?.patientId ? 'pencil-square' : 'person-plus'}
            footer={
              <>
                <Show when={!props?.hideCreatePrescription}>
                  <Button
                    class="w-full xs:w-fit"
                    size="lg"
                    disabled={loading()}
                    loading={loading() && isCreatePrescription()}
                    onClick={() => submitForm(true)}
                  >
                    {props?.patientId ? 'Save' : 'Create'} and start prescription
                  </Button>
                </Show>
                <Show when={!!hasPatients() || !!props?.hideCreatePrescription}>
                  <Button
                    class="w-full xs:w-fit"
                    size="lg"
                    variant={props?.hideCreatePrescription ? 'primary' : 'secondary'}
                    disabled={loading()}
                    loading={loading() && !isCreatePrescription()}
                    onClick={() => submitForm(false)}
                  >
                    {props?.patientId ? 'Save' : 'Create'}
                  </Button>
                </Show>
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
                <PatientForm
                  store={store}
                  actions={actions}
                  patientId={props.patientId}
                  optionalPatientAddress={props.optionalPatientAddress}
                  initialPatientLoading={loadingPatient()}
                  initialPreferredPharmacy={initialPreferredPharmacy()}
                />
              </>
            }
          />
        </Portal>
      </Show>
    </div>
  );
};
customElement(
  'photon-patient-dialog',
  {
    patientId: '',
    hideCreatePrescription: false,
    open: false,
    optionalPatientAddress: false
  },
  Component
);
