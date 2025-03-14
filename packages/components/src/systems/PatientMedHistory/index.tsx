import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { Prescription, Treatment } from '@photonhealth/sdk/dist/types';
import { Button, Card, createQuery, Text, triggerToast } from '../../';
import { ApolloCache } from '@apollo/client';
import PatientMedHistoryTable from './PatientMedHistoryTable';

const GET_PATIENT_MED_HISTORY = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      treatmentHistory {
        active
        prescription {
          id
          writtenAt
          instructions
          dispenseQuantity
          dispenseUnit
          daysSupply
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

export type PatientTreatmentHistoryElement = {
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
        <PatientMedHistoryTable
          enableLinks={props.enableLinks}
          baseURL={baseURL()}
          medHistory={medHistory()}
          chronological={chronological()}
          onChronologicalChange={() => setChronological(!chronological())}
        />
      </div>
    </Card>
  );
}
