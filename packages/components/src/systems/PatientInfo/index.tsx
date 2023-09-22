import { createSignal, onMount, Show } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { Patient } from '@photonhealth/sdk/dist/types';

const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      name {
        full
      }
    }
  }
`;

type PatientInfoProps = {
  patientId: string;
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

  return (
    <div>
      <Show when={patient()}>
        <div>{patient()?.name.full}</div>
      </Show>
    </div>
  );
}
