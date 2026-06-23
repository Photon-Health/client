import { Order, Prescription } from '@photonhealth/sdk/dist/types';
import { GraphQLFormattedError } from 'graphql';
import { createContext, JSXElement, useContext } from 'solid-js';
import { dispatchAnalyticsTrackEvent as _dispatchAnalyticsTrackEvent } from '../analytics/dispatchAnalyticsTrackEvent';
import type { AnalyticsCategory, AnalyticsEventMap } from '@photonhealth/sdk';
import { PrescriptionScreeningAlert } from '@photonhealth/sdk/dist/clinical-api/types';

interface PrescribeEventDispatchContextValue {
  dispatchFormValidate: (canSubmit: boolean, form: any) => void;
  dispatchDraftPrescriptionCreated: (draftPrescription: Prescription) => void;
  dispatchDraftPrescriptionDeleted: (prescription?: Prescription) => void;
  dispatchPrescriptionsCreated: (prescriptions: Prescription[]) => void;
  dispatchPrescriptionsError: (errors: GraphQLFormattedError[]) => void;
  dispatchOrderCreated: (order: Order) => void;
  dispatchOrderCombined: (order: Order) => void;
  dispatchOrderError: (errors: readonly GraphQLFormattedError[]) => void;
  dispatchTicketCreatedDuplicate: () => void;
  dispatchClinicalAlertAcknowledge: (alerts: PrescriptionScreeningAlert[]) => void;
  dispatchClinicalAlertCancel: (alerts: PrescriptionScreeningAlert[]) => void;
  dispatchSignatureAttestationAgreed: () => void;
  dispatchSignatureAttestationCanceled: () => void;
  dispatchAttestationResolved: () => void;
  dispatchAnalyticsTrackEvent: <C extends AnalyticsCategory>(
    category: C,
    event: AnalyticsEventMap[C]
  ) => void;
  dispatchSupervisorError: (errors: string[]) => void;
  dispatchDiagnosisCodeError: (errors: string[]) => void;
}

const PrescribeEventDispatchContext = createContext<PrescribeEventDispatchContextValue>();

interface DraftPrescriptionProviderProps {
  children: JSXElement;
}

export const PrescribeEventDispatchProvider = (props: DraftPrescriptionProviderProps) => {
  let ref!: HTMLDivElement;

  const dispatchFormValidate: PrescribeEventDispatchContextValue['dispatchFormValidate'] = (
    canSubmit,
    form
  ) => {
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

  const dispatchDraftPrescriptionCreated: PrescribeEventDispatchContextValue['dispatchDraftPrescriptionCreated'] =
    (draftPrescription) => {
      const event = new CustomEvent('photon-draft-prescription-created', {
        composed: true,
        bubbles: true,
        detail: {
          draft: draftPrescription
        }
      });
      ref.dispatchEvent(event);
    };

  const dispatchDraftPrescriptionDeleted: PrescribeEventDispatchContextValue['dispatchDraftPrescriptionDeleted'] =
    (prescription) => {
      const event = new CustomEvent('photon-draft-prescription-deleted', {
        composed: true,
        bubbles: true,
        detail: {
          prescription
        }
      });
      ref.dispatchEvent(event);
    };

  const dispatchPrescriptionsCreated: PrescribeEventDispatchContextValue['dispatchPrescriptionsCreated'] =
    (prescriptions) => {
      const event = new CustomEvent('photon-prescriptions-created', {
        composed: true,
        bubbles: true,
        detail: {
          prescriptions: prescriptions
        }
      });
      ref.dispatchEvent(event);
    };

  const dispatchPrescriptionsError: PrescribeEventDispatchContextValue['dispatchPrescriptionsError'] =
    (errors) => {
      const event = new CustomEvent('photon-prescriptions-error', {
        composed: true,
        bubbles: true,
        detail: {
          errors: errors
        }
      });
      ref.dispatchEvent(event);
    };

  const dispatchOrderCreated: PrescribeEventDispatchContextValue['dispatchOrderCreated'] = (
    order
  ) => {
    const event = new CustomEvent('photon-order-created', {
      composed: true,
      bubbles: true,
      detail: {
        order
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderCombined: PrescribeEventDispatchContextValue['dispatchOrderCombined'] = (
    order
  ) => {
    const event = new CustomEvent('photon-order-combined', {
      composed: true,
      bubbles: true,
      detail: { order }
    });
    ref.dispatchEvent(event);
  };

  const dispatchOrderError: PrescribeEventDispatchContextValue['dispatchOrderError'] = (errors) => {
    const event = new CustomEvent('photon-order-error', {
      composed: true,
      bubbles: true,
      detail: {
        errors: errors
      }
    });
    ref.dispatchEvent(event);
  };

  const dispatchTicketCreatedDuplicate: PrescribeEventDispatchContextValue['dispatchTicketCreatedDuplicate'] =
    () => {
      const event = new CustomEvent('photon-ticket-created-duplicate', {
        composed: true,
        bubbles: true,
        detail: {}
      });

      ref.dispatchEvent(event);
    };

  const dispatchClinicalAlertAcknowledge: PrescribeEventDispatchContextValue['dispatchClinicalAlertAcknowledge'] =
    (alerts) => {
      const event = new CustomEvent('photon-clinical-alert-acknowledge', {
        composed: true,
        bubbles: true,
        detail: {
          alerts
        }
      });

      ref.dispatchEvent(event);
    };

  const dispatchClinicalAlertCancel: PrescribeEventDispatchContextValue['dispatchClinicalAlertCancel'] =
    (alerts) => {
      const event = new CustomEvent('photon-clinical-alert-cancel', {
        composed: true,
        bubbles: true,
        detail: {
          alerts
        }
      });

      ref.dispatchEvent(event);
    };

  const dispatchSignatureAttestationAgreed: PrescribeEventDispatchContextValue['dispatchSignatureAttestationAgreed'] =
    () => {
      const event = new CustomEvent('photon-signature-attestation-agreed', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

  const dispatchSignatureAttestationCanceled: PrescribeEventDispatchContextValue['dispatchSignatureAttestationCanceled'] =
    () => {
      const event = new CustomEvent('photon-signature-attestation-canceled', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

  const dispatchAttestationResolved: PrescribeEventDispatchContextValue['dispatchAttestationResolved'] =
    () => {
      const event = new CustomEvent('photon-signature-attestation-resolved', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

  const dispatchAnalyticsTrackEvent: PrescribeEventDispatchContextValue['dispatchAnalyticsTrackEvent'] =
    (category, event) => _dispatchAnalyticsTrackEvent(category, event, ref);

  const dispatchSupervisorError: PrescribeEventDispatchContextValue['dispatchSupervisorError'] = (
    errors
  ) => {
    const event = new CustomEvent('photon-supervisor-error', {
      composed: true,
      bubbles: true,
      detail: { errors }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchDiagnosisCodeError: PrescribeEventDispatchContextValue['dispatchDiagnosisCodeError'] =
    (errors) => {
      console.error(errors);
      const event = new CustomEvent('photon-diagnosis-code-error', {
        composed: true,
        bubbles: true,
        detail: { errors }
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
    dispatchSignatureAttestationCanceled,
    dispatchAttestationResolved,
    dispatchAnalyticsTrackEvent,
    dispatchSupervisorError,
    dispatchDiagnosisCodeError
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
