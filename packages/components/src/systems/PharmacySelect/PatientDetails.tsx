import { Patient } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createSignal, onMount } from 'solid-js';
import { usePhoton } from '../../context';
import Text from '../../particles/Text';

interface PatientDetailsProps {
  patientId: string;
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
  const client = usePhoton();
  const [patient, setPatient] = createSignal<Patient | null>(null);

  async function fetchPatient() {
    console.log(props.patientId);
    const { data } = await client!.sdk.apollo.query({
      query: GetPatientQuery,
      variables: { id: props.patientId }
    });
    console.log(data, props.patientId);
    if (data?.patient) {
      setPatient(data.patient);
    }
  }

  onMount(() => {
    fetchPatient();
  });

  return (
    <div class="flex flex-col items-start	">
      <Text loading={!patient()} sampleLoadingText="Loading Name">
        {patient()?.name.full}
      </Text>
      <Text loading={!patient()} color="gray" size="sm" sampleLoadingText="111 222 3333">
        {patient()?.phone}
      </Text>
      <Text loading={!patient()} color="gray" size="sm" sampleLoadingText="loading@gmail.com">
        {patient()?.email}
      </Text>
    </div>
  );
}
