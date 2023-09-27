import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { PhotonClient } from '@photonhealth/sdk';
import { PatientMedication, Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import Table from '../../particles/Table';
import Text from '../../particles/Text';
import generateString from '../../utils/generateString';
import Badge from '../../particles/Badge';
import formatDate from '../../utils/formatDate';
import Button from '../../particles/Button';

const GET_PATIENT_MED_HISTORY = gql`
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

const ADD_MED_HISTORY = gql`
  mutation UpdateMedicationHistory($id: ID!, $medicationHistory: [MedHistoryInput!]!) {
    updatePatient(id: $id, medicationHistory: $medicationHistory) {
      id
    }
  }
`;

type PatientMedHistoryProps = {
  patientId: string;
  openAddMedication?: () => void;
  newMedication?: Medication | SearchMedication;
};

const LoadingRowFallback = () => (
  <Table.Row>
    <Table.Cell>
      <Text sampleLoadingText={generateString(10, 45)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString(6, 8)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString()} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString()} loading />
    </Table.Cell>
  </Table.Row>
);

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const [medHistory, setMedHistory] = createSignal<PatientMedication[] | undefined>(undefined);

  const baseURL = createMemo(() =>
    client.uri.replace('api', 'app').replace('graphql', 'prescriptions')
  );

  const fetchPatient = async () => {
    const { data } = await client!.apollo.query({
      query: GET_PATIENT_MED_HISTORY,
      variables: { id: props.patientId }
    });
    if (data?.patient?.medicationHistory) {
      setMedHistory(data.patient.medicationHistory);
    }
  };

  const addMedHistory = async (medicationId: string) => {
    await (client as PhotonClient)!.apollo.mutate({
      mutation: ADD_MED_HISTORY,
      variables: { id: props.patientId, medicationHistory: [{ medicationId, active: false }] },
      update: (cache) => {
        const existingPatient: any = cache.readQuery({
          query: GET_PATIENT_MED_HISTORY,
          variables: { id: props.patientId }
        });

        const newPatient = {
          ...existingPatient.patient,
          medicationHistory: [
            {
              __typename: 'PatientMedication',
              medication: props.newMedication,
              active: false,
              prescription: null
            },
            ...existingPatient.patient.medicationHistory
          ]
        };
        cache.writeQuery({
          query: GET_PATIENT_MED_HISTORY,
          variables: { id: props.patientId },
          data: { patient: newPatient }
        });

        fetchPatient();
      }
    });
  };

  createEffect(() => {
    if (props.patientId) {
      fetchPatient();
    }
  });

  createEffect(() => {
    if (props?.newMedication?.id) {
      addMedHistory(props.newMedication.id);
    }
  });

  return (
    <div class="divide-y divide-gray-200">
      <div class="flex justify-between pb-4">
        <h5>Medication History</h5>
        <Show when={props?.openAddMedication}>
          <Button variant="secondary" size="sm" onClick={props?.openAddMedication}>
            + Add
          </Button>
        </Show>
      </div>
      <div class="max-h-80 overflow-y-auto">
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
                    <Table.Cell>
                      {med.active ? (
                        <Badge color="green" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge color="red" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>{formatDate(med.prescription?.writtenAt)}</Table.Cell>
                    <Table.Cell>
                      {med.prescription?.id ? (
                        <a
                          class="text-blue-500 underline"
                          target="_blank"
                          href={`${baseURL()}/${med.prescription?.id}`}
                        >
                          Link
                        </a>
                      ) : (
                        'External'
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Show>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}