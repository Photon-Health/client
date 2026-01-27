import { Order, Prescription } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createContext, JSXElement, useContext } from 'solid-js';

const PrescribeEventDispatchContext = createContext<{
  dispatchFormValidate: (canSubmit: boolean, form: any) => void;
  dispatchDraftPrescriptionCreated: (draftPrescription: Prescription) => void;
  dispatchDraftPrescriptionDeleted: (prescription?: Prescription) => void;
  dispatchPrescriptionsCreated: (prescriptions: Prescription[]) => void;
  dispatchPrescriptionsError: (errors: GraphQLFormattedError[]) => void;
  dispatchOrderCreated: (order: Order) => void;
  dispatchOrderError: (errors: GraphQLFormattedError[]) => void;
}>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const PrescribeEventDispatchProvider = (props: DraftPrescriptionProviderProps) => {
  let ref!: HTMLDivElement;

  const dispatchFormValidate = (canSubmit: boolean, form: any) => {
    const event = new CustomEvent('photon-form-validate', {
      composed: true,
      bubbles: true,
      detail: {
        canSubmit,
        form
      }
    });
    ref.dispatchEvent(event);
  };

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

  const dispatchPrescriptionsCreated = (prescriptions: Prescription[]) => {
    const event = new CustomEvent('photon-prescriptions-created', {
      composed: true,
      bubbles: true,
      detail: {
        prescriptions: prescriptions
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchPrescriptionsError = (errors: GraphQLFormattedError[]) => {
    const event = new CustomEvent('photon-prescriptions-error', {
      composed: true,
      bubbles: true,
      detail: {
        errors: errors
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderCreated = (order: Order) => {
    const event = new CustomEvent('photon-order-created', {
      composed: true,
      bubbles: true,
      detail: {
        order: order
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderError = (errors: GraphQLFormattedError[]) => {
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
    dispatchFormValidate,
    dispatchDraftPrescriptionCreated,
    dispatchDraftPrescriptionDeleted,
    dispatchPrescriptionsCreated,
    dispatchPrescriptionsError,
    dispatchOrderCreated,
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
