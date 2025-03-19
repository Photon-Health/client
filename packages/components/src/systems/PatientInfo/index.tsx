import { createEffect, createMemo, createSignal, JSXElement, Show } from 'solid-js';
import gql from 'graphql-tag';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { Patient } from '@photonhealth/sdk/dist/types';
import { usePhotonClient } from '../SDKProvider';
import Button from '../../particles/Button';
import Text from '../../particles/Text';
import Card from '../../particles/Card';

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

type PatientInfoProps = {
  patientId: string;
  weight?: number;
  weightUnit?: string;
  editPatient?: () => void;
  updatedAt?: number;
  address?: Address;
};

// Takes a date string in the format 'YYYY-MM-DD'
// and returns it in the format 'MM-DD-YYYY'.
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

export default function PatientInfo(props: PatientInfoProps) {
  const client = usePhotonClient();
  const [patient, setPatient] = createSignal<Patient | undefined>(undefined);

  const fetchPatient = async () => {
    const { data } = await client!.apollo.query({
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

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center justify-between">
        <Text color="gray">Patient Info</Text>
        <Show when={props?.editPatient}>
          <Button variant="secondary" size="sm" onClick={props?.editPatient}>
            Edit Patient
          </Button>
        </Show>
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
