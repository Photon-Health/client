import { Patient } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createMemo, createSignal, onMount } from 'solid-js';
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
        {patient()?.phone}
      </Text>
      <Text
        loading={!patient()}
        selected={selected()}
        color="gray"
        size="sm"
        sampleLoadingText="loading@gmail.com"
      >
        {patient()?.email}
      </Text>
    </div>
  );
}
