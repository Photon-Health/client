import { createContext, JSXElement, useContext } from 'solid-js';
import { vi } from 'vitest';

type PrescribeEventDispatchContextType = {
  dispatchFormValidate: (...args: never[]) => void;
  dispatchDraftPrescriptionCreated: (...args: never[]) => void;
  dispatchDraftPrescriptionDeleted: (...args: never[]) => void;
  dispatchPrescriptionsCreated: (...args: never[]) => void;
  dispatchPrescriptionsError: (...args: never[]) => void;
  dispatchOrderCreated: (...args: never[]) => void;
  dispatchOrderCombined: (...args: never[]) => void;
  dispatchOrderError: (...args: never[]) => void;
  dispatchTicketCreatedDuplicate: (...args: never[]) => void;
  dispatchClinicalAlertAcknowledge: (...args: never[]) => void;
  dispatchClinicalAlertCancel: (...args: never[]) => void;
  dispatchSignatureAttestationAgreed: (...args: never[]) => void;
  dispatchSignatureAttestationCanceled: (...args: never[]) => void;
  dispatchAnalytics: (...args: never[]) => void;
};

export const MockPrescribeEventDispatchContext = createContext<PrescribeEventDispatchContextType>();

export const mockPrescribeEventDispatchValues = (): PrescribeEventDispatchContextType => ({
  dispatchFormValidate: vi.fn(),
  dispatchDraftPrescriptionCreated: vi.fn(),
  dispatchDraftPrescriptionDeleted: vi.fn(),
  dispatchPrescriptionsCreated: vi.fn(),
  dispatchPrescriptionsError: vi.fn(),
  dispatchOrderCreated: vi.fn(),
  dispatchOrderCombined: vi.fn(),
  dispatchOrderError: vi.fn(),
  dispatchTicketCreatedDuplicate: vi.fn(),
  dispatchClinicalAlertAcknowledge: vi.fn(),
  dispatchClinicalAlertCancel: vi.fn(),
  dispatchSignatureAttestationAgreed: vi.fn(),
  dispatchSignatureAttestationCanceled: vi.fn(),
  dispatchAnalytics: vi.fn()
});

export function MockPrescribeEventDispatchProvider(props: { children: JSXElement }) {
  const mocks = mockPrescribeEventDispatchValues();
  return (
    <MockPrescribeEventDispatchContext.Provider value={mocks}>
      {props.children}
    </MockPrescribeEventDispatchContext.Provider>
  );
}

export const useMockPrescribeEventDispatch = () => {
  const context = useContext(MockPrescribeEventDispatchContext);
  if (!context) {
    throw new Error("can't find MockPrescribeEventDispatchContext");
  }
  return context;
};
