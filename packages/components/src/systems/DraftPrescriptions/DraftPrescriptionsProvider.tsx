import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  JSXElement,
  Setter,
  useContext
} from 'solid-js';
import { Prescription } from '@photonhealth/sdk/dist/types';

const DraftPrescriptionsContext = createContext<{
  // values
  draftPrescriptions: Accessor<Prescription[]>;
  prescriptionIds: Accessor<string[]>;

  // actions
  setDraftPrescriptions: Setter<Prescription[]>;
}>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const DraftPrescriptionsProvider = (props: DraftPrescriptionProviderProps) => {
  const [draftPrescriptions, setDraftPrescriptions] = createSignal<Prescription[]>([]);

  const prescriptionIds = createMemo(() =>
    draftPrescriptions().map((prescription) => prescription.id)
  );

  const value = {
    // values
    draftPrescriptions,
    prescriptionIds,
    // actions
    setDraftPrescriptions
  };

  return (
    <DraftPrescriptionsContext.Provider value={value}>
      {props.children}
    </DraftPrescriptionsContext.Provider>
  );
};

export const useDraftPrescriptions = () => {
  const context = useContext(DraftPrescriptionsContext);
  if (!context) {
    throw new Error("can't find DraftPrescriptionsContext");
  }
  return context;
};
