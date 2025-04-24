import { Accessor, createContext, createSignal, JSXElement, Setter, useContext } from 'solid-js';
import { Prescription } from '@photonhealth/sdk/dist/types';

const DraftPrescriptionsContext = createContext<{
  // values
  draftPrescriptions: Accessor<Prescription[]>;
  // actions
  setDraftPrescriptions: Setter<Prescription[]>;
}>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const DraftPrescriptionsProvider = (props: DraftPrescriptionProviderProps) => {
  const [draftPrescriptions, setDraftPrescriptions] = createSignal<Prescription[]>([]);

  const value = {
    // values
    draftPrescriptions,
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
