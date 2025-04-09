import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import gql from 'graphql-tag';
import { usePhotonClient } from '../SDKProvider';
import { Prescription, Treatment } from '@photonhealth/sdk/dist/types';
import {
  Button,
  Card,
  createQuery,
  PrescriptionFormData,
  Text,
  triggerToast,
  usePrescribe
} from '../../';
import { ApolloCache } from '@apollo/client';
import PatientMedHistoryTable, { MedHistoryRowItem } from './PatientMedHistoryTable';
import { Maybe } from 'graphql/jsutils/Maybe';

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
          notes
          fillsAllowed
          dispenseQuantity
          dispenseUnit
          dispenseAsWritten
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

type RemoveMaybe<T> = T extends Maybe<infer U>
  ? Exclude<U, null>
  : T extends undefined
  ? never
  : Exclude<T, null>;

type RemoveMaybeFromArray<T> = T extends Array<Maybe<infer U>>
  ? Array<Exclude<RemoveMaybe<U>, null>>
  : RemoveMaybe<T>;

type PrescriptionWithoutMaybes = {
  [K in keyof Prescription]-?: RemoveMaybeFromArray<RemoveMaybe<Prescription[K]>>;
};

export type MedHistoryPrescription = Pick<
  PrescriptionWithoutMaybes,
  | 'id'
  | 'writtenAt'
  | 'dispenseQuantity'
  | 'dispenseUnit'
  | 'daysSupply'
  | 'instructions'
  | 'fillsAllowed'
  | 'dispenseAsWritten'
  | 'notes'
>;

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
  enableRefillButton: boolean;
  newMedication?: Treatment;
  openAddMedicationDialog?: () => void;
  hideAddMedicationDialog?: () => void;
};

export type GetPatientTreatmentHistoryItem = {
  treatment: Treatment;
  prescription?: Prescription;
};

type GetPatientResponse = {
  patient: {
    id: string;
    treatmentHistory: GetPatientTreatmentHistoryItem[];
  };
};

export default function PatientMedHistory(props: PatientMedHistoryProps) {
  const client = usePhotonClient();
  const prescribeContext = usePrescribe();
  if (!prescribeContext) {
    throw new Error('PrescribeWorkflow must be wrapped with PrescribeProvider');
  }
  const { createPrescription } = prescribeContext;

  const [medHistoryRowItems, setMedHistoryRowItems] = createSignal<MedHistoryRowItem[] | undefined>(
    undefined
  );
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('asc');

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

  createEffect(() => {
    const getPatientResponse = patientMedHistory();
    if (patientMedHistory.loading) {
      setMedHistoryRowItems(undefined);
    } else if (getPatientResponse) {
      const rowItems = mapToMedHistoryRowItems(getPatientResponse);
      const sortedRowItems = rowItems.slice().sort(sortHistoryByDate(sortOrder()));
      setMedHistoryRowItems(sortedRowItems);
    } else {
      setMedHistoryRowItems([]);
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
    const newMed: MedHistoryRowItem = {
      treatment: props.newMedication as Treatment,
      prescription: undefined
    };
    setMedHistoryRowItems((prev) => (prev ? [newMed, ...prev] : [newMed]));

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

  async function createPrescriptionFromMedHistory(prescription: PrescriptionFormData) {
    await createPrescription(prescription);
    triggerToast({
      status: 'success',
      header: 'Prescription Added',
      body: 'You can send this order or add another prescription before sending it'
    });
  }

  return (
    <Card addChildrenDivider={true} autoPadding={false}>
      <div class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
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
          enableRefillButton={props.enableRefillButton}
          baseURL={baseURL()}
          rowItems={medHistoryRowItems()}
          sortOrder={sortOrder()}
          onSortOrderToggle={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          onRefillClick={createPrescriptionFromMedHistory}
        />
      </div>
    </Card>
  );
}

const mapToMedHistoryRowItems = (getPatientResponse: GetPatientResponse): MedHistoryRowItem[] =>
  getPatientResponse?.patient?.treatmentHistory.map((historyItem) => ({
    treatment: historyItem.treatment,
    prescription: historyItem.prescription as MedHistoryPrescription
  }));

const sortHistoryByDate = (order: 'asc' | 'desc') => {
  return (a: MedHistoryRowItem, b: MedHistoryRowItem) => {
    const dateA = a?.prescription?.writtenAt
      ? new Date(a.prescription.writtenAt).getTime()
      : -Infinity;
    const dateB = b?.prescription?.writtenAt
      ? new Date(b.prescription.writtenAt).getTime()
      : -Infinity;
    if (order === 'desc') return dateA - dateB;
    return dateB - dateA;
  };
};
