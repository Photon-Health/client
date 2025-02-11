import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import {
  Medication,
  SearchMedication,
  Prescription,
  Treatment
} from '@photonhealth/sdk/dist/types';
import Table from '../../particles/Table';
import Text from '../../particles/Text';
import generateString from '../../utils/generateString';
import formatDate from '../../utils/formatDate';
import Button from '../../particles/Button';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import { usePhoton } from '@photonhealth/react';
import { useQuery } from '@apollo/client';

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
  openAddMedication?: () => void;
  newMedication?: Medication | SearchMedication;
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

type PatientMedHistoryElement = {
  active: boolean;
  comment?: string;
  treatment: Treatment;
  prescription?: Prescription;
};

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const { clinicalClient } = usePhoton();
  const [medHistory, setMedHistory] = createSignal<PatientMedHistoryElement[] | undefined>(
    undefined
  );
  const [chronological, setChronological] = createSignal<boolean>(false);

  const baseURL = createMemo(() => `${client?.clinicalUrl}/prescriptions/`);

  const { data, loading } = useQuery(GET_PATIENT_MED_HISTORY, {
    client: clinicalClient
  });

  createEffect(() => {
    const sortHistoryFunction = (a: PatientMedHistoryElement, b: PatientMedHistoryElement) => {
      const dateA = a?.prescription?.writtenAt
        ? new Date(a.prescription.writtenAt).getTime()
        : -Infinity;
      const dateB = b?.prescription?.writtenAt
        ? new Date(b.prescription.writtenAt).getTime()
        : -Infinity;
      if (chronological()) return dateA - dateB;
      return dateB - dateA;
    };

    const medicationHistory = data()?.patient?.treatmentHistory;
    if (medicationHistory) {
      const sortedMedHistory = medicationHistory.slice().sort(sortHistoryFunction);
      setMedHistory(sortedMedHistory);
    }
    if (!loading && !medicationHistory) {
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
    <Card addChildrenDivider={true}>
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
