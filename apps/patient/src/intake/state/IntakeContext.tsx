import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { ConditionFlow } from '../conditions';
import { IntakePatient, PharmacyOption } from '../api/types';

type IntakeState = {
  /** E.164, carried from the phone screen through code entry and lookup. */
  phone?: string;
  /** Kept so the new-profile screen can prefill what the lookup already asked for. */
  lastName?: string;
  dateOfBirth?: string;
  patient?: IntakePatient;
  /** Screener result, kept so review can show what qualified the request. */
  eligibility?: Eligibility;
  answers: Record<string, string>;
  /** Entered on the zip screen when the patient has no address on file. */
  postalCode?: string;
  prescriptionId?: string;
  orderId?: string;
  pharmacies: PharmacyOption[];
  pharmacyName?: string;
};

export type Eligibility = {
  /** Total inches — the two height fields are joined before they are stored. */
  heightInches: number;
  weightPounds: number;
  bmi: number;
  /** Values from `flow.eligibility.conditions`. */
  conditions: string[];
  meetsCriteria: boolean;
};

type IntakeContextValue = IntakeState & {
  flow: ConditionFlow;
  setPhone: (phone: string) => void;
  setIdentity: (identity: { lastName: string; dateOfBirth: string }) => void;
  setPatient: (patient: IntakePatient) => void;
  setEligibility: (eligibility: Eligibility) => void;
  setAnswer: (questionId: string, value: string) => void;
  setPostalCode: (postalCode: string) => void;
  setPrescriptionId: (id: string) => void;
  setDraft: (draft: { orderId: string | null; pharmacies: PharmacyOption[] }) => void;
  setPharmacyName: (name: string | null) => void;
};

const IntakeContext = createContext<IntakeContextValue | null>(null);

export const IntakeProvider = ({
  flow,
  children
}: {
  flow: ConditionFlow;
  children: ReactNode;
}) => {
  const [state, setState] = useState<IntakeState>({ answers: {}, pharmacies: [] });

  const value = useMemo<IntakeContextValue>(
    () => ({
      ...state,
      flow,
      setPhone: (phone) => setState((prev) => ({ ...prev, phone })),
      setIdentity: ({ lastName, dateOfBirth }) =>
        setState((prev) => ({ ...prev, lastName, dateOfBirth })),
      setPatient: (patient) => setState((prev) => ({ ...prev, patient })),
      setEligibility: (eligibility) => setState((prev) => ({ ...prev, eligibility })),
      setAnswer: (questionId, answer) =>
        setState((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: answer } })),
      setPostalCode: (postalCode) => setState((prev) => ({ ...prev, postalCode })),
      setPrescriptionId: (prescriptionId) => setState((prev) => ({ ...prev, prescriptionId })),
      setDraft: ({ orderId, pharmacies }) =>
        setState((prev) => ({ ...prev, orderId: orderId ?? prev.orderId, pharmacies })),
      setPharmacyName: (pharmacyName) =>
        setState((prev) => ({ ...prev, pharmacyName: pharmacyName ?? undefined }))
    }),
    [state, flow]
  );

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
};

export const useIntake = () => {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error('useIntake must be used inside IntakeProvider');
  }
  return context;
};
