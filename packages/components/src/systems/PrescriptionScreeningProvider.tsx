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
import { usePrescribeEventDispatch } from './PrescribeEventDispatchProvider';
import {
  DiagnosisCode,
  DiagnosisCodeType,
  PrescriptionScreeningAlert
} from '@photonhealth/sdk/dist/clinical-api/types';

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

export interface PrescriptionScreeningContextValue {
  screeningAlerts: Accessor<PrescriptionScreeningAlert[]>;
  screenDraftedPrescriptions: () => Promise<void>;
}

const PrescriptionScreeningContext = createContext<PrescriptionScreeningContextValue>();

export type DiagnosisCodesPrefill = Partial<DiagnosisCode>[] | string;

interface PrescriptionScreeningProviderProps {
  children: JSXElement;
  formStore: any;
  diagnosisCodes?: DiagnosisCodesPrefill;
}

export const PrescriptionScreeningProvider = (props: PrescriptionScreeningProviderProps) => {
  const client = usePhoton();
  const { draftPrescriptions } = useDraftPrescriptions();
  const { dispatchDiagnosisCodeError } = usePrescribeEventDispatch();
  const [screeningAlerts, setScreeningAlerts] = createSignal<PrescriptionScreeningAlert[]>([]);
  const [diagnosisCodes, setDiagnosisCodes] = createSignal<DiagnosisCode[]>();

  createEffect(() => {
    if (!props.diagnosisCodes) {
      return;
    }
    if (typeof props.diagnosisCodes === 'string') {
      const error = 'Invalid diagnosis codes json passed in';
      // TODO: Thoughts on logging to console as well?
      console.error(error);
      dispatchDiagnosisCodeError([error]);
      return;
    }

    const validCodes: DiagnosisCode[] = [];
    const invalidCodes = [];
    for (const dc of props.diagnosisCodes) {
      const isValid =
        dc.code &&
        dc.type &&
        Object.values(DiagnosisCodeType).includes(dc.type as DiagnosisCodeType);

      if (isValid) {
        validCodes.push(dc as DiagnosisCode);
      } else {
        invalidCodes.push(dc);
      }
    }

    if (invalidCodes.length) {
      const error = `Invalid diagnosis codes detected: ${JSON.stringify(invalidCodes)}`;
      console.error(error);
      dispatchDiagnosisCodeError([error]);
      // TODO: should we abort entirely or continue screening with valid codes?
      return;
    }

    if (validCodes.length) {
      setDiagnosisCodes(validCodes);
    }
  });

  const screenDraftedPrescriptions = async () => {
    // start out by getting the treatment id of the prescription we're drafting now -
    // this won't be included in draftPrescriptions
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
        draftedPrescriptions: dedupedSanitizedPrescriptions,
        diagnosisCodes: diagnosisCodes()
      }
    });

    setScreeningAlerts(data?.prescriptionScreen?.alerts ?? []);
  };

  createEffect(() => {
    // if drafted prescriptions gets appended to,
    // such as in the case of re-prescribing from
    // med history, we need to screen the new
    // prescriptions
    if (draftPrescriptions().length > 0) {
      screenDraftedPrescriptions();
    }
  });

  const value: PrescriptionScreeningContextValue = {
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
