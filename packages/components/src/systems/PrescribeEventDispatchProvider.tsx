import { Prescription } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createContext, JSXElement, useContext } from 'solid-js';

const PrescribeEventDispatchContext = createContext<{
  dispatchDraftPrescriptionCreated: (draftPrescription: Prescription) => void;
  dispatchDraftPrescriptionDeleted: (prescription?: Prescription) => void;
  dispatchOrderError: (errors: readonly GraphQLFormattedError[]) => void;
}>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const PrescribeEventDispatchProvider = (props: DraftPrescriptionProviderProps) => {
  let ref!: HTMLDivElement;

  const dispatchDraftPrescriptionCreated = (draftPrescription: Prescription) => {
    const event = new CustomEvent('photon-draft-prescription-created', {
      composed: true,
      bubbles: true,
      detail: {
        draft: draftPrescription
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchDraftPrescriptionDeleted = (prescription?: Prescription) => {
    const event = new CustomEvent('photon-draft-prescription-deleted', {
      composed: true,
      bubbles: true,
      detail: {
        prescription
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderError = (errors: readonly GraphQLFormattedError[]) => {
    const event = new CustomEvent('photon-order-error', {
      composed: true,
      bubbles: true,
      detail: {
        errors: errors
      }
    });
    ref.dispatchEvent(event);
  };

  const value = {
    dispatchDraftPrescriptionCreated,
    dispatchDraftPrescriptionDeleted,
    dispatchOrderError
  };

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
