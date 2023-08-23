import { Patient } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createMemo, createSignal, onMount, Show } from 'solid-js';
import Badge from '../../particles/Badge';
import { useRadioGroup } from '../../particles/RadioGroup';
import Text from '../../particles/Text';
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
          city
          state
        }
      }
    }
  }
`;

export function PatientDetails(props: PatientDetailsProps) {
  const [state] = useRadioGroup();
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
        <Show when={preferredPharmacy()}>
          {preferredPharmacy()?.name}{' '}
          <Badge size="sm" color="blue" class="ml-1">
            Preferred
          </Badge>
        </Show>
        <Show when={!preferredPharmacy()}>{patient()?.phone}</Show>
      </Text>
      <Text
        loading={!patient()}
        selected={selected()}
        color="gray"
        size="sm"
        sampleLoadingText="loading@gmail.com"
      >
        <Show when={preferredPharmacy()}>
          {preferredPharmacy()?.address?.street1} {preferredPharmacy()?.address?.city}
          {', '}
          {preferredPharmacy()?.address?.state}
        </Show>
        <Show when={!preferredPharmacy()}>{patient()?.email}</Show>
      </Text>
    </div>
  );
}
