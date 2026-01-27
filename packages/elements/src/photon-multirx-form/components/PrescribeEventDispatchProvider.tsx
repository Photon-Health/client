import { Prescription } from '@photonhealth/sdk/dist/types';
import { createContext, JSXElement, useContext } from 'solid-js';

const PrescribeEventDispatchContext = createContext<{
  dispatchDraftPrescriptionCreated: (draftPrescription: Prescription) => void;
}>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const PrescribeEventDispatchProvider = (props: DraftPrescriptionProviderProps) => {
  let ref!: HTMLDivElement;

  const dispatchDraftPrescriptionCreated = (draftPrescription: Prescription) => {
    console.log('dispatchDraftPrescriptionCreated called');
    const event = new CustomEvent('photon-draft-prescription-created', {
      composed: true,
      bubbles: true,
      detail: {
        draft: draftPrescription
      }
    });
    console.log(ref.dispatchEvent);
    ref.dispatchEvent(event);
  };

  const value = { dispatchDraftPrescriptionCreated };

  return (
    <PrescribeEventDispatchContext.Provider value={value}>
      <div ref={ref}>{props.children}</div>
    </PrescribeEventDispatchContext.Provider>
  );
};

export const usePrescribeEventDispatch = () => {
  const context = useContext(PrescribeEventDispatchContext);
  if (!context) {
    throw new Error("can't find PrescribeEventDispatchContext");
  }
  return context;
};
