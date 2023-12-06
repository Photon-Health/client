import { Patient } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createMemo, createSignal, onMount, Show } from 'solid-js';
import Badge from '../../particles/Badge';
import { useRadioGroupCards } from '../../particles/RadioGroupCards';
import Text from '../../particles/Text';
import formatAddress from '../../utils/formatAddress';
import { usePhotonClient } from '../SDKProvider';

interface PatientDetailsProps {
  patientId: string;
  selected?: boolean;
}

const GetPatientQuery = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      name {
        full
      }
      email
      phone
      preferredPharmacies {
        name
        address {
          street1
          street2
          city
          state
          postalCode
        }
      }
    }
  }
`;

export function PatientDetails(props: PatientDetailsProps) {
  const [state] = useRadioGroupCards();
  const client = usePhotonClient();
  const [patient, setPatient] = createSignal<Patient | null>(null);

  async function fetchPatient() {
    const { data } = await client!.apollo.query({
      query: GetPatientQuery,
      variables: { id: props.patientId }
    });

    if (data?.patient) {
      setPatient(data.patient);
    }
  }

  onMount(() => {
    fetchPatient();
  });

  const selected = createMemo(() => {
    return state.selected === props.patientId;
  });

  const preferredPharmacy = createMemo(() => {
    return patient()?.preferredPharmacies?.[0];
  });

  return (
    <div class="flex flex-col items-start	">
      <Text loading={!patient()} selected={selected()} sampleLoadingText="Loading Name">
        {patient()?.name.full}
      </Text>
      <Text
        loading={!patient()}
        selected={selected()}
        color="gray"
        size="sm"
        sampleLoadingText="111 222 3333"
      >
        <Show when={preferredPharmacy()} fallback={<Text>{patient()?.phone}</Text>}>
          {preferredPharmacy()?.name}{' '}
          <Badge size="sm" color="blue" class="ml-1">
            Preferred
          </Badge>
        </Show>
      </Text>
      <Text
        loading={!patient()}
        selected={selected()}
        color="gray"
        size="sm"
        sampleLoadingText="loading@gmail.com"
      >
        <Show when={preferredPharmacy()} fallback={patient()?.email}>
          {formatAddress(preferredPharmacy()?.address)}
        </Show>
      </Text>
    </div>
  );
}
