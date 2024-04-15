import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { PatientMedication, Medication, SearchMedication } from '@photonhealth/sdk/dist/types';
import Table from '../../particles/Table';
import Text from '../../particles/Text';
import generateString from '../../utils/generateString';
import formatDate from '../../utils/formatDate';
import Button from '../../particles/Button';
import Card from '../../particles/Card';
import { createQuery } from '../../utils/createQuery';
import Icon from '../../particles/Icon';

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

type SelectedPatientMedication = Pick<PatientMedication, 'active' | 'medication' | 'prescription'>;

type GetPatientResponse = {
  patient: {
    id: string;
    medicationHistory: SelectedPatientMedication[];
  };
};

const LoadingRowFallback = () => (
  <Table.Row>
    <Table.Cell>
      <Text sampleLoadingText={generateString(10, 25)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString(2, 8)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString(4, 8)} loading />
    </Table.Cell>
  </Table.Row>
);

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const [medHistory, setMedHistory] = createSignal<PatientMedication[] | undefined>(undefined);
  const [chronological, setChronological] = createSignal<boolean>(false);

  const baseURL = createMemo(() => `${client?.clinicalUrl}/prescriptions/`);

  const queryOptions = createMemo(() => ({
    variables: { id: props.patientId },
    client: client!.apollo
  }));

  const patientMedHistory = createQuery<GetPatientResponse, { id: string }>(
    GET_PATIENT_MED_HISTORY,
    queryOptions
  );

  createEffect(() => {
    const medicationHistory = patientMedHistory()?.patient?.medicationHistory;
    if (medicationHistory) {
      const sortedMedHistory = medicationHistory.slice().sort((a, b) => {
        const dateA = a?.prescription?.writtenAt
          ? new Date(a.prescription.writtenAt).getTime()
          : -Infinity;
        const dateB = b?.prescription?.writtenAt
          ? new Date(b.prescription.writtenAt).getTime()
          : -Infinity;
        if (chronological()) return dateA - dateB;
        return dateB - dateA;
      });
      setMedHistory(sortedMedHistory);
    }
    if (!patientMedHistory.loading && !medicationHistory) {
      setMedHistory([]);
    }
  });

  const addMedHistory = async (medicationId: string) => {
    await client!.apollo.mutate({
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
      }
    });
  };

  createEffect(() => {
    if (props?.newMedication?.id) {
      addMedHistory(props.newMedication.id);
    }
  });

  return (
    <Card>
      <div class="flex items-center justify-between">
        <Text color="gray">Medication History</Text>
        <Show when={props?.openAddMedication}>
          <Button variant="secondary" size="sm" onClick={props?.openAddMedication}>
            + Add
          </Button>
        </Show>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <Table>
          <Table.Header>
            <Table.Col width="16rem">Medication</Table.Col>
            <Table.Col>
              <span class="cursor-pointer flex" onClick={() => setChronological(!chronological())}>
                Written
                <Show when={chronological()}>
                  <Icon name="chevronDown" size="sm" />
                </Show>
                <Show when={!chronological()}>
                  <Icon name="chevronUp" size="sm" />
                </Show>
              </span>
            </Table.Col>
            <Table.Col>Source</Table.Col>
          </Table.Header>
          <Table.Body>
            <Show
              when={medHistory()}
              fallback={
                <>
                  <LoadingRowFallback />
                  <LoadingRowFallback />
                  <LoadingRowFallback />
                </>
              }
            >
              <For each={medHistory()}>
                {(med) => (
                  <Table.Row>
                    <Table.Cell width="16rem">{med.medication?.name}</Table.Cell>
                    <Table.Cell>{formatDate(med.prescription?.writtenAt) || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      {med.prescription?.id ? (
                        <a
                          class="text-blue-500 underline"
                          target="_blank"
                          href={`${baseURL()}${med.prescription?.id}`}
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
    </Card>
  );
}
