import { createSignal, createEffect, Show, For } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { PatientMedication } from '@photonhealth/sdk/dist/types';
import Table from '../../particles/Table';
import Text from '../../particles/Text';
import generateString from '../../utils/generateString';

const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      medicationHistory {
        active
        prescription {
          id
          writtenAt
        }
        medication {
          id
          name
        }
      }
    }
  }
`;

type PatientMedHistoryProps = {
  patientId: string;
};

const LoadingRowFallback = () => (
  <Table.Row>
    <Table.Cell>
      <Text sampleLoadingText={generateString(10, 17)} loading></Text>
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString()} loading></Text>
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString()} loading></Text>
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString()} loading></Text>
    </Table.Cell>
  </Table.Row>
);

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const [medHistory, setMedHistory] = createSignal<PatientMedication[] | undefined>(undefined);

  const fetchPatient = async () => {
    const { data } = await client!.apollo.query({
      query: GET_PATIENT,
      variables: { id: props.patientId }
    });
    if (data?.patient?.medicationHistory) {
      console.log(data.patient.medicationHistory);
      setMedHistory(data.patient.medicationHistory);
    }
  };

  createEffect(() => {
    if (props.patientId) {
      fetchPatient();
    }
  });

  return (
    <Table>
      <Table.Header>
        <Table.Col>Medication</Table.Col>
        <Table.Col>Status</Table.Col>
        <Table.Col>Written</Table.Col>
        <Table.Col>Source</Table.Col>
      </Table.Header>
      <Table.Body>
        <Show
          when={medHistory()}
          fallback={[LoadingRowFallback, LoadingRowFallback, LoadingRowFallback]}
        >
          <For each={medHistory()}>
            {(med) => (
              <Table.Row>
                <Table.Cell>{med.medication?.name}</Table.Cell>
                <Table.Cell>{med.active ? 'Active' : 'Inactive'}</Table.Cell>
                <Table.Cell>{med.prescription?.writtenAt}</Table.Cell>
                <Table.Cell>{med.prescription?.id ? 'Photon' : 'External'}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Show>
      </Table.Body>
    </Table>
  );
}
