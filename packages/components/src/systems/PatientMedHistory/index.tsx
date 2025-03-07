import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import {
  Medication,
  SearchMedication,
  Prescription,
  Treatment
} from '@photonhealth/sdk/dist/types';
import {
  Icon,
  Card,
  Button,
  Text,
  Table,
  generateString,
  createQuery,
  formatDate,
  triggerToast
} from '../../';
import { ApolloCache } from '@apollo/client';

const GET_PATIENT_MED_HISTORY = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      treatmentHistory {
        active
        prescription {
          id
          writtenAt
        }
        treatment {
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
  enableLinks: boolean;
  newMedication?: Treatment;
  openAddMedicationDialog?: () => void;
  hideAddMedicationDialog?: () => void;
};

const LoadingRowFallback = (props: { enableLinks: boolean }) => (
  <Table.Row>
    <Table.Cell>
      <Text sampleLoadingText={generateString(10, 25)} loading />
    </Table.Cell>
    <Table.Cell>
      <Text sampleLoadingText={generateString(2, 8)} loading />
    </Table.Cell>
    <Show when={props.enableLinks}>
      <Table.Cell>
        <Text sampleLoadingText={generateString(4, 8)} loading />
      </Table.Cell>
    </Show>
  </Table.Row>
);

type PatientTreatmentHistoryElement = {
  active: boolean;
  comment?: string;
  treatment: Treatment;
  prescription?: Prescription;
};

type GetPatientResponse = {
  patient: {
    id: string;
    treatmentHistory: PatientTreatmentHistoryElement[];
  };
};

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const [medHistory, setMedHistory] = createSignal<PatientTreatmentHistoryElement[] | undefined>(
    undefined
  );
  const [chronological, setChronological] = createSignal<boolean>(false);

  const baseURL = createMemo(() => `${client?.clinicalUrl}/prescriptions/`);

  const queryOptions = createMemo(() => ({
    variables: { id: props.patientId },
    client: client!.apolloClinical,
    skip: !props.patientId,
    fetchPolicy: 'network-only' as const,
    refetchQueries: [GET_PATIENT_MED_HISTORY]
  }));

  const patientMedHistory = createQuery<GetPatientResponse, { id: string }>(
    GET_PATIENT_MED_HISTORY,
    queryOptions
  );

  const sortHistoryByDate = (chronological: boolean) => {
    return (a: PatientTreatmentHistoryElement, b: PatientTreatmentHistoryElement) => {
      const dateA = a?.prescription?.writtenAt
        ? new Date(a.prescription.writtenAt).getTime()
        : -Infinity;
      const dateB = b?.prescription?.writtenAt
        ? new Date(b.prescription.writtenAt).getTime()
        : -Infinity;
      if (chronological) return dateA - dateB;
      return dateB - dateA;
    };
  };

  createEffect(() => {
    const medicationHistory = patientMedHistory()?.patient?.treatmentHistory;
    if (medicationHistory) {
      const sortedMedHistory = medicationHistory.slice().sort(sortHistoryByDate(chronological()));
      setMedHistory(sortedMedHistory);
    }
    if (!patientMedHistory.loading && !medicationHistory) {
      setMedHistory([]);
    }
  });

  const addMedHistory = async (medicationId: string) => {
    const updateCache = (cache: ApolloCache<GetPatientResponse>) => {
      const newTreatment = {
        __typename: 'PatientMedication',
        treatment: {
          __typename: 'Treatment',
          ...props.newMedication
        },
        active: false,
        prescription: null
      };

      const existingData = cache.readQuery({
        query: GET_PATIENT_MED_HISTORY,
        variables: { id: props.patientId }
      }) as GetPatientResponse | null;

      const treatmentHistory = existingData?.patient?.treatmentHistory ?? [];

      cache.writeQuery({
        query: GET_PATIENT_MED_HISTORY,
        variables: { id: props.patientId },
        data: {
          patient: {
            __typename: 'Patient',
            id: props.patientId,
            treatmentHistory: [newTreatment, ...treatmentHistory]
          }
        }
      });
    };

    await client!.apollo.mutate({
      mutation: ADD_MED_HISTORY,
      variables: {
        id: props.patientId,
        medicationHistory: [{ medicationId, active: false }]
      },
      update: updateCache
    });

    // Update local state immediately
    const newMed: PatientTreatmentHistoryElement = {
      active: false,
      treatment: props.newMedication as Treatment,
      prescription: undefined
    };
    setMedHistory((prev) => (prev ? [newMed, ...prev] : [newMed]));

    // Show toast notification
    triggerToast({
      header: 'Medication Added',
      body: 'Medication has been added to patients history.',
      status: 'success'
    });

    props.hideAddMedicationDialog?.();
  };

  createEffect(() => {
    if (props?.newMedication?.id) {
      addMedHistory(props.newMedication.id);
    }
  });

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center justify-between">
        <Text color="gray">Medication History</Text>
        <Show when={props?.openAddMedicationDialog}>
          <Button variant="secondary" size="sm" onClick={props?.openAddMedicationDialog}>
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
                <div class="ml-1">
                  <Show when={chronological()}>
                    <Icon name="chevronDown" size="sm" />
                  </Show>
                  <Show when={!chronological()}>
                    <Icon name="chevronUp" size="sm" />
                  </Show>
                </div>
              </span>
            </Table.Col>
            <Show when={props.enableLinks}>
              <Table.Col>Source</Table.Col>
            </Show>
          </Table.Header>
          <Table.Body>
            <Show
              when={medHistory()}
              fallback={
                <>
                  <LoadingRowFallback enableLinks={props.enableLinks} />
                  <LoadingRowFallback enableLinks={props.enableLinks} />
                  <LoadingRowFallback enableLinks={props.enableLinks} />
                </>
              }
            >
              <For each={medHistory()}>
                {(med) => (
                  <Table.Row>
                    <Table.Cell width="16rem">{med.treatment?.name}</Table.Cell>
                    <Table.Cell>{formatDate(med.prescription?.writtenAt) || 'N/A'}</Table.Cell>
                    <Show when={props.enableLinks}>
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
                    </Show>
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
