import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { ScreenDraftedPrescriptionsQuery } from '@photonhealth/sdk';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { usePhoton } from '../context';
import { useDraftPrescriptions } from './DraftPrescriptions/DraftPrescriptionsProvider';
import { ScreeningAlertType } from './ScreeningAlerts/ScreeningAlert';

type ScreenablePrescription = {
  dispenseAsWritten?: boolean;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  daysSupply?: number;
  instructions?: string;
  notes?: string;
  effectiveDate?: string;
  treatment: {
    id: string;
  };
};

const toScreenableDraftPrescription = (prescription: Prescription): ScreenablePrescription => ({
  dispenseAsWritten: prescription.dispenseAsWritten || undefined,
  dispenseQuantity: prescription.dispenseQuantity,
  dispenseUnit: prescription.dispenseUnit,
  fillsAllowed: prescription.fillsAllowed,
  daysSupply: prescription.daysSupply || undefined,
  instructions: prescription.instructions,
  notes: prescription.notes || undefined,
  effectiveDate: prescription.effectiveDate,
  treatment: { id: prescription.treatment.id }
});

const removeDuplicateTreatments = (
  prescriptions: ScreenablePrescription[]
): ScreenablePrescription[] => {
  const seenTreatmentIds = new Set<string>();
  return prescriptions.filter(({ treatment }) => {
    if (seenTreatmentIds.has(treatment.id)) return false;
    seenTreatmentIds.add(treatment.id);
    return true;
  });
};

export interface PrescriptionScreeningContextType {
  screeningAlerts: Accessor<ScreeningAlertType[]>;
  screenDraftedPrescriptions: () => Promise<void>;
}

const PrescriptionScreeningContext = createContext<PrescriptionScreeningContextType>();

interface PrescriptionScreeningProviderProps {
  children: JSXElement;
  formStore: any;
}

export const PrescriptionScreeningProvider = (props: PrescriptionScreeningProviderProps) => {
  const client = usePhoton();
  const { draftPrescriptions } = useDraftPrescriptions();

  const [screeningAlerts, setScreeningAlerts] = createSignal<ScreeningAlertType[]>([]);

  const screenDraftedPrescriptions = async () => {
    const inProgressDraftedPrescriptionTreatmentId = props.formStore.treatment?.value?.id;

    const draftedPrescriptions: ScreenablePrescription[] = draftPrescriptions().map(
      toScreenableDraftPrescription
    );

    if (inProgressDraftedPrescriptionTreatmentId) {
      draftedPrescriptions.push({ treatment: { id: inProgressDraftedPrescriptionTreatmentId } });
    }

    const dedupedSanitizedPrescriptions = removeDuplicateTreatments(draftedPrescriptions);

    const { data } = await client.sdk.apolloClinical.query({
      query: ScreenDraftedPrescriptionsQuery,
      variables: {
        patientId: props.formStore.patient?.value?.id,
        draftedPrescriptions: dedupedSanitizedPrescriptions
      }
    });

    setScreeningAlerts(data?.prescriptionScreen?.alerts ?? []);
  };

  createEffect(() => {
    if (draftPrescriptions().length > 0) {
      screenDraftedPrescriptions();
    }
  });

  const value: PrescriptionScreeningContextType = {
    screeningAlerts,
    screenDraftedPrescriptions
  };

  return (
    <PrescriptionScreeningContext.Provider value={value}>
      {props.children}
    </PrescriptionScreeningContext.Provider>
  );
};

export const usePrescriptionScreening = () => {
  const context = useContext(PrescriptionScreeningContext);
  if (!context) {
    throw new Error('usePrescriptionScreening must be used within PrescriptionScreeningProvider');
  }
  return context;
};
