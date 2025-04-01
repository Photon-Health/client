import { createEffect, createMemo, createSignal, JSXElement, Show } from 'solid-js';
import gql from 'graphql-tag';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { Patient } from '@photonhealth/sdk/dist/types';
import { usePhotonClient } from '../SDKProvider';
import Button from '../../particles/Button';
import Text from '../../particles/Text';
import Card from '../../particles/Card';
import Dialog from '../../particles/Dialog';
import PatientFormV2, { EditFormPatient } from './PatientFormV2';

type PatientInfoProps = {
  patientId: string;
  weight?: number;
  weightUnit?: string;
  enableEditPatient?: boolean;
  updatedAt?: number;
  address?: Address;
};

export default function PatientInfo(props: PatientInfoProps) {
  const client = usePhotonClient();
  const [patient, setPatient] = createSignal<Patient | undefined>(undefined);
  const [editFormPatient, setEditFormPatient] = createSignal<EditFormPatient | undefined>(
    undefined
  );
  const [showEditPatient, setShowEditPatient] = createSignal<boolean>(false);

  const fetchPatient = async () => {
    const { data, loading } = await client!.apollo.query({
      query: GET_PATIENT,
      variables: { id: props.patientId }
    });
    if (data?.patient) {
      setPatient(data?.patient);
    }
  };

  createEffect(() => {
    if (props.patientId) {
      fetchPatient();
    }
  });

  const address = createMemo(() => {
    return props.address || patient()?.address;
  });

  const phoneNumber = createMemo(() => {
    if (patient()?.phone) {
      const pn = parsePhoneNumber(patient()?.phone);
      return pn.valid ? pn.number.national : patient()?.phone;
    }
    return '';
  });

  const onEditPatientFormChange = (edited: EditFormPatient) => {
    setEditFormPatient(edited);
  };

  const onEditPatientFormSubmitted = async () => {
    // setGlobalError(undefined);
    // setIsCreatePrescription(createPrescription);
    // setLoading(true);
    // let keys: string[] = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'sex', 'email'];
    //
    // if (
    //   store['address_street1']?.value !== undefined ||
    //   store['address_city']?.value !== undefined ||
    //   store['address_state']?.value !== undefined ||
    //   store['address_zip']?.value !== undefined
    // ) {
    //   actions.registerValidator({
    //     key: 'address_street1',
    //     validator: message(size(string(), 1, Infinity), 'Please enter a valid Street 1..')
    //   });
    //   actions.registerValidator({
    //     key: 'address_city',
    //     validator: message(size(string(), 1, Infinity), 'Please enter a valid City..')
    //   });
    //   actions.registerValidator({
    //     key: 'address_state',
    //     validator: message(size(string(), 2, 2), 'Please enter a valid State..')
    //   });
    //   keys = [...keys, 'address_zip', 'address_street1', 'address_city', 'address_state'];
    // } else {
    //   const keysToRemove = ['address_street1', 'address_city', 'address_state'];
    //   for (const key of keysToRemove) {
    //     actions.unRegisterValidator(key);
    //   }
    // }
    //
    // actions.validate(keys);
    // if (actions.hasErrors(keys)) {
    //   setLoading(false);
    //   return true;
    // }
    //
    // if (
    //   store['preferredPharmacy']!.value &&
    //   pStore.selectedPatient.data?.preferredPharmacies &&
    //   pStore.selectedPatient.data?.preferredPharmacies.length !== 0 &&
    //   !pStore.selectedPatient.data?.preferredPharmacies
    //     ?.map((x: any) => x?.id)
    //     .filter((x: any) => x !== null)
    //     .includes(store['preferredPharmacy']!.value)
    // ) {
    //   // remove existing preferred pharmacy in order to add the new one
    //   const removePreferredPharmacyMutation = client!
    //     .getSDK()
    //     .clinical.patient.removePatientPreferredPharmacy({});
    //   await removePreferredPharmacyMutation({
    //     variables: {
    //       patientId: props.patientId,
    //       pharmacyId: pStore.selectedPatient.data?.preferredPharmacies![0]!.id
    //     },
    //     awaitRefetchQueries: false
    //   });
    // }
    //
    // const patientData = {
    //   ...(props?.patientId ? { id: props.patientId } : {}),
    //   name: {
    //     first: store['firstName']!.value,
    //     last: store['lastName']!.value
    //   },
    //   gender: store['gender']!.value,
    //   email: store['email']!.value,
    //   phone: store['phone']!.value,
    //   dateOfBirth: store['dateOfBirth']!.value,
    //   sex: store['sex']!.value,
    //   address:
    //     store['address_street1']!.value !== undefined
    //       ? {
    //           street1: store['address_street1']!.value,
    //           street2: store['address_street2']!.value,
    //           city: store['address_city']!.value,
    //           state: store['address_state']!.value,
    //           postalCode: store['address_zip']!.value,
    //           country: 'US'
    //         }
    //       : undefined,
    //   preferredPharmacies: store['preferredPharmacy']!.value
    //     ? [store['preferredPharmacy']!.value]
    //     : []
    // };

    setShowEditPatient(false);

    const patientData = editFormPatient();
    try {
      if (patientData?.id) {
        const updatePatientMutation = client!.clinical.patient.updatePatient({});
        await updatePatientMutation({ variables: patientData, awaitRefetchQueries: false });
        // dispatchUpdate(props.patientId, createPrescription);
      } else if (patientData) {
        const createPatientMutation = client!.clinical.patient.createPatient({});
        const createdPatient = await createPatientMutation({
          variables: patientData,
          awaitRefetchQueries: false
        });
        // dispatchCreated(patient?.data?.createPatient?.id || '', createPrescription);
      }
      // setLoading(false);
      // actions.resetStores();
    } catch (e: any) {
      // setLoading(false);
      // setGlobalError(e?.message || 'An error occurred while saving the patient.');
    }
  };

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center justify-between">
        <Text color="gray">Patient Info</Text>
        <Show when={props?.enableEditPatient}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowEditPatient(true);
            }}
          >
            Edit Patient
          </Button>
        </Show>
        <Dialog open={showEditPatient()}>
          <Show when={patient()}>
            {(p) => (
              <>
                <button onClick={onEditPatientFormSubmitted}>Submit Form</button>
                <PatientFormV2 patient={p()} onFormUpdated={onEditPatientFormChange} />
              </>
            )}
          </Show>
        </Dialog>
      </div>
      <div class="pt-4" data-dd-privacy="mask">
        <Text size="lg" bold loading={!patient()} sampleLoadingText="Sally Patient">
          {patient()?.name.full || 'N/A'}
        </Text>
        <div class="pt-4 sm:grid sm:grid-cols-2 sm:gap-2">
          <table class="table-auto">
            <tbody>
              <InfoRow label="Email">
                <Text size="sm" loading={!patient()} sampleLoadingText="fake@email.com">
                  {patient()?.email || 'N/A'}
                </Text>
              </InfoRow>
              <InfoRow label="Phone">
                <Text size="sm" loading={!patient()} sampleLoadingText="555-555-5555">
                  {phoneNumber() || 'N/A'}
                </Text>
              </InfoRow>
              <InfoRow label="Address">
                <Show when={!patient() || address()} fallback={<div>N/A</div>}>
                  <div>
                    <Text size="sm" loading={!patient()} sampleLoadingText="123 Fake St">
                      {address()?.street1}
                    </Text>
                  </div>
                  <Show when={!patient() || address()?.street2}>
                    <div>
                      <Text size="sm" loading={!patient()} sampleLoadingText="Apt 3">
                        {address()?.street2}
                      </Text>
                    </div>
                  </Show>
                  <div>
                    <Text size="sm" loading={!patient()} sampleLoadingText="Brooklyn, NY 11221">
                      {address()?.city}, {address()?.state} {address()?.postalCode}
                    </Text>
                  </div>
                </Show>
              </InfoRow>
            </tbody>
          </table>

          <table class="table-auto">
            <tbody>
              <InfoRow label="DOB">
                <Text size="sm" loading={!patient()} sampleLoadingText="female">
                  {formatDate(patient()?.dateOfBirth || 'N/A')}
                </Text>
              </InfoRow>
              <InfoRow label="Weight">
                <Text size="sm" loading={!patient()} sampleLoadingText="150 lbs">
                  {props?.weight ? `${props.weight} ${props.weightUnit}` : 'N/A'}
                </Text>
              </InfoRow>
              <InfoRow label="Sex">
                <Text size="sm" loading={!patient()} sampleLoadingText="female">
                  {patient()?.sex || 'N/A'}
                </Text>
              </InfoRow>
              <InfoRow label="Gender">
                <Text size="sm" loading={!patient()} sampleLoadingText="female">
                  {patient()?.gender || 'N/A'}
                </Text>
              </InfoRow>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      name {
        full
      }
      email
      phone
      sex
      gender
      dateOfBirth
      address {
        street1
        street2
        city
        state
        postalCode
      }
    }
  }
`;

type InfoRowProps = {
  label: string;
  children: JSXElement | JSXElement[];
};
const InfoRow = (props: InfoRowProps) => {
  return (
    <tr>
      <td class="align-top py-1 w-20">
        <Text size="sm" color="gray">
          {props.label}
        </Text>
      </td>
      <td class="align-top py-1">{props.children}</td>
    </tr>
  );
};

export type Address = {
  city: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: string;
  country?: string;
};

// Takes a date string in the format 'YYYY-MM-DD'
// and returns it in the format 'MM-DD-YYYY'.
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};
