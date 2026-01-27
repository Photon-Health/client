import { Order, Prescription } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createContext, JSXElement, useContext } from 'solid-js';
import { ScreeningAlertType } from './ScreeningAlerts';

const PrescribeEventDispatchContext = createContext<{
  dispatchFormValidate: (canSubmit: boolean, form: any) => void;
  dispatchDraftPrescriptionCreated: (draftPrescription: Prescription) => void;
  dispatchDraftPrescriptionDeleted: (prescription?: Prescription) => void;
  dispatchPrescriptionsCreated: (prescriptions: Prescription[]) => void;
  dispatchPrescriptionsError: (errors: GraphQLFormattedError[]) => void;
  dispatchOrderCreated: (order: Order) => void;
  dispatchOrderCombined: (order: Order) => void;
  dispatchOrderError: (errors: readonly GraphQLFormattedError[]) => void;
  dispatchTicketCreatedDuplicate: () => void;
  dispatchClinicalAlertAcknowledge: (alerts: ScreeningAlertType[]) => void;
  dispatchClinicalAlertCancel: (alerts: ScreeningAlertType[]) => void;
  dispatchSignatureAttestationAgreed: () => void;
  dispatchSignatureAttestationCanceled: () => void;
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
        order
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderCombined = (order: Order) => {
    const event = new CustomEvent('photon-order-combined', {
      composed: true,
      bubbles: true,
      detail: { order }
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

  const dispatchTicketCreatedDuplicate = () => {
    // triggers the parent flow to clears the add prescription form
    const event = new CustomEvent('photon-ticket-created-duplicate', {
      composed: true,
      bubbles: true,
      detail: {}
    });

    ref.dispatchEvent(event);
  };

  const dispatchClinicalAlertAcknowledge = (alerts: ScreeningAlertType[]) => {
    const event = new CustomEvent('photon-clinical-alert-acknowledge', {
      composed: true,
      bubbles: true,
      detail: {
        alerts
      }
    });

    ref.dispatchEvent(event);
  };

  const dispatchClinicalAlertCancel = (alerts: ScreeningAlertType[]) => {
    const event = new CustomEvent('photon-clinical-alert-cancel', {
      composed: true,
      bubbles: true,
      detail: {
        alerts
      }
    });

    ref.dispatchEvent(event);
  };

  const dispatchSignatureAttestationAgreed = () => {
    const event = new CustomEvent('photon-signature-attestation-agreed', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const dispatchSignatureAttestationCanceled = () => {
    const event = new CustomEvent('photon-signature-attestation-canceled', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const value = {
    dispatchFormValidate,
    dispatchDraftPrescriptionCreated,
    dispatchDraftPrescriptionDeleted,
    dispatchPrescriptionsCreated,
    dispatchPrescriptionsError,
    dispatchOrderCreated,
    dispatchOrderCombined,
    dispatchOrderError,
    dispatchTicketCreatedDuplicate,
    dispatchClinicalAlertAcknowledge,
    dispatchClinicalAlertCancel,
    dispatchSignatureAttestationAgreed,
    dispatchSignatureAttestationCanceled
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
