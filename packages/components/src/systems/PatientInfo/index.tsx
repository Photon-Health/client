import { createSignal, onMount, JSXElement, Show, createMemo } from 'solid-js';
import gql from 'graphql-tag';
import { Patient } from '@photonhealth/sdk/dist/types';
import { usePhotonClient } from '../SDKProvider';
import Text from '../../particles/Text';

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
      address {
        street1
        street2
        city
        state
        postalCode
      }
      preferredPharmacies {
        name
        address {
          street1
          city
          state
          postalCode
        }
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
    <div class="py-2 grid grid-cols-3 gap-2">
      <div class="text-sm text-gray-400">
        <Text size="sm" color="gray">
          {props.label}
        </Text>
      </div>
      <div class="text-sm col-span-2">{props.children}</div>
    </div>
  );
};

type PatientInfoProps = {
  patientId: string;
  weight?: number;
};

export default function PatientInfo(props: PatientInfoProps) {
  const client = usePhotonClient();
  const [patient, setPatient] = createSignal<Patient | undefined>(undefined);

  const fetchPatient = async () => {
    const { data } = await client!.apollo.query({
      query: GET_PATIENT,
      variables: { id: props.patientId }
    });

    return data?.patient;
  };

  onMount(async () => {
    const patient = await fetchPatient();
    setPatient(patient);
  });

  const address = createMemo(() => {
    return patient()?.address;
  });

  const preferredPharmacy = createMemo(() => {
    return patient()?.preferredPharmacies?.[0];
  });

  return (
    <div class="divide-y divide-gray-200">
      <div class="pb-4">
        <h4>Patient Info</h4>
      </div>
      <div class="pt-4 sm:grid sm:grid-cols-2 sm:gap-2">
        <div>
          <InfoRow label="Patient ID">
            <Text size="sm" loading={!patient()} sampleLoadingText="Sally Patient">
              {patient()?.name.full}
            </Text>
          </InfoRow>
          <InfoRow label="Email">
            <Text size="sm" loading={!patient()} sampleLoadingText="fake@email.com">
              {patient()?.email}
            </Text>
          </InfoRow>
          <InfoRow label="Mobile Phone">
            <Text size="sm" loading={!patient()} sampleLoadingText="555-555-5555">
              {patient()?.phone}
            </Text>
          </InfoRow>
          <InfoRow label="Address">
            <Show when={!patient() || address()}>
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
        </div>

        <div>
          <InfoRow label="Sex at Birth">
            <Text size="sm" loading={!patient()} sampleLoadingText="female">
              {patient()?.sex}
            </Text>
          </InfoRow>
          <InfoRow label="Gender">
            <Text size="sm" loading={!patient()} sampleLoadingText="male/man">
              {patient()?.gender}
            </Text>
          </InfoRow>
          <InfoRow label="Weight">
            <Text size="sm" loading={!patient()} sampleLoadingText="150 lbs">
              {props?.weight ? `${props.weight} lbs` : 'N/A'}
            </Text>
          </InfoRow>
          <InfoRow label="Pharmacy">
            <Show when={!patient() || preferredPharmacy()}>
              <div>
                <Text size="sm" loading={!patient()} sampleLoadingText="CVS Pharmacy">
                  {preferredPharmacy()?.name}
                </Text>
              </div>
              <div>
                <Text size="sm" loading={!patient()} sampleLoadingText="123 Fake St">
                  {preferredPharmacy()?.address?.street1}
                </Text>
              </div>
              <div>
                <Text size="sm" loading={!patient()} sampleLoadingText="Brooklyn, NY 11221">
                  {preferredPharmacy()?.address?.city}, {preferredPharmacy()?.address?.state}{' '}
                  {preferredPharmacy()?.address?.postalCode}
                </Text>
              </div>
            </Show>
          </InfoRow>
        </div>
      </div>
    </div>
  );
}
