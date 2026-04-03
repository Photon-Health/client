import { cleanup, render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { GoogleServiceProvider, PhotonContext, SDKProvider } from '@photonhealth/components';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import {
  PhotonPrescribeWorkflowComponent,
  type PrescribeWorkflowComponentProps
} from './photon-prescribe-workflow-component';
import { createTestClient, createTestClientStore } from '../test-utils/createTestClient';
import {
  clinicalGql,
  defaultHandlers,
  DISPENSE_UNIT,
  TREATMENT
} from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }

  Object.defineProperty(window, 'google', {
    configurable: true,
    writable: true,
    value: {
      maps: {
        Geocoder: class Geocoder {},
        places: { AutocompleteService: class AutocompleteService {} }
      }
    }
  });
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
  await PatientStore.actions.reset();
});

afterAll(() => server.close());

type AnalyticsDetail = Record<string, unknown>;

test('page views', async () => {
  const { analyticsEvents } = renderPrescribeWorkflow({}, { attestationStatus: 'NEEDS' });

  await waitForSignatureAttestationModal();
  const event = analyticsEvents.find(isPageView('Signature Attestation Page Viewed'));
  expect(event?.detail).toEqual(
    expect.objectContaining({
      attestationVersion: 'v1',
      timestamp: expect.any(String)
    })
  );
});

test('field interactions', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow();

  await waitForPrescribeForm();

  await user.type(screen.getByLabelText(/quantity/i), '30');
  await user.tab();

  await user.selectOptions(screen.getByLabelText(/dispense unit/i), DISPENSE_UNIT.name);
  await user.tab();

  await user.type(screen.getByLabelText(/days supply/i), '10');
  await user.tab();

  await user.type(screen.getByLabelText(/^refills/i), '0');
  await user.tab();

  await user.type(screen.getByLabelText(/patient instructions/i), 'Take one daily');
  await user.tab();

  await user.type(screen.getByLabelText(/pharmacy note/i), 'Generic OK');
  await user.tab();

  await user.click(screen.getByLabelText(/dispense as written/i));
  await user.click(screen.getByLabelText(/add to personal templates/i));

  // Assert each field interaction
  const fieldInteractionEvents = analyticsEvents.filter(
    isFieldInteraction({ formName: 'add_prescription_form' })
  );
  const fieldInteractions = fieldInteractionEvents.map((e) => ({
    fieldName: (e.detail as AnalyticsDetail).fieldName,
    isOptional: (e.detail as AnalyticsDetail).isOptional
  }));

  expect(fieldInteractions).toEqual(
    expect.arrayContaining([
      { fieldName: 'dispenseQuantity', isOptional: false },
      { fieldName: 'dispenseUnit', isOptional: false },
      { fieldName: 'daysSupply', isOptional: true },
      { fieldName: 'refills', isOptional: true },
      { fieldName: 'instructions', isOptional: false },
      { fieldName: 'pharmacy_notes', isOptional: true },
      { fieldName: 'dispenseAsWritten', isOptional: true },
      { fieldName: 'addToTemplates', isOptional: true }
    ])
  );

  // Verify each has the common fields
  for (const event of fieldInteractionEvents) {
    expect(event.detail).toEqual(
      expect.objectContaining({
        timestamp: expect.any(String)
      })
    );
  }
});

test('pharmacy tab field interactions', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    enableLocalPickup: true,
    enableDeliveryPharmacies: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();

  await screen.findByText('Send to Patient', {}, { timeout: 3000 });

  await user.click(screen.getByText('Local Pickup'));

  const localPickupEvent = analyticsEvents.find(
    isFieldInteraction({ tabSelected: 'Local Pickup' })
  );
  expect(localPickupEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      hasPreferredPharmacy: false,
      timestamp: expect.any(String)
    })
  );

  await user.click(screen.getByText('Mail Order'));
  const mailOrderEvent = analyticsEvents.find(isFieldInteraction({ tabSelected: 'Mail Order' }));
  expect(mailOrderEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      hasPreferredPharmacy: false,
      timestamp: expect.any(String)
    })
  );

  // Click back to "Send to Patient" tab
  await user.click(screen.getByText('Send to Patient'));
  const sendToPatientEvent = analyticsEvents.find(
    isFieldInteraction({ tabSelected: 'Send to Patient' })
  );
  expect(sendToPatientEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      hasPreferredPharmacy: false,
      timestamp: expect.any(String)
    })
  );
});

test('Send Order CTAs', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();

  // 1. Add a draft prescription
  await addDraftPrescription(user);

  const draftAddedEvent = analyticsEvents.find(isCTA('Draft Prescription Added'));
  expect(draftAddedEvent?.detail).toEqual(
    expect.objectContaining({
      draftPrescriptionSource: 'form',
      fields: expect.objectContaining({
        treatment: { completed: true },
        dispenseQuantity: { completed: true },
        dispenseUnit: { completed: true },
        instructions: { completed: true }
      }),
      timestamp: expect.any(String)
    })
  );

  // Verify draft was added
  await screen.findByText('Draft Prescriptions', {}, { timeout: 3000 });

  // 2. Send the order
  await user.click(screen.getByRole('button', { name: /^send$/i }));

  await waitFor(() => {
    expect(analyticsEvents.find(isCTA('Order Sent'))).toBeDefined();
  });

  const orderSent = analyticsEvents.find(isCTA('Order Sent'));
  expect(orderSent?.detail).toEqual(
    expect.objectContaining({
      buttonText: 'Send',
      orderId: 'ord_abc',
      prescriptionCount: 1,
      fulfillmentType: 'SEND_TO_PATIENT',
      isCombinedOrder: false,
      timestamp: expect.any(String)
    })
  );
});

test('attestation CTA', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow({}, { attestationStatus: 'NEEDS' });

  await waitForSignatureAttestationModal();

  // Assert page view fired
  expect(analyticsEvents.find(isPageView('Signature Attestation Page Viewed'))).toBeDefined();

  // Click cancel
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  const canceled = analyticsEvents.find(isCTA('Signature Attestation Canceled'));
  expect(canceled?.detail).toEqual(
    expect.objectContaining({
      category: 'ctaClicked',
      name: 'Signature Attestation Canceled',
      buttonText: 'Cancel',
      timestamp: expect.any(String)
    })
  );
});

test('photon-signature-attestation-resolved fires when no attestation needed', async () => {
  const { attestationResolvedEvents } = renderPrescribeWorkflow();

  await waitFor(
    () => {
      expect(attestationResolvedEvents.length).toEqual(1);
    },
    { timeout: 5000 }
  );
});

test('photon-signature-attestation-resolved does not fire before user agrees when attestation required', async () => {
  const { attestationResolvedEvents, user } = renderPrescribeWorkflow(
    {},
    { attestationStatus: 'NEEDS' }
  );

  await waitForSignatureAttestationModal();

  // Must not have fired yet — user hasn't agreed
  expect(attestationResolvedEvents.length).toBe(0);

  await user.click(screen.getByRole('button', { name: /agree/i }));

  await waitFor(() => {
    expect(attestationResolvedEvents.length).toEqual(1);
  });
});

test('Signature Attestation Page Viewed fires before photon-signature-attestation-resolved when attestation required', async () => {
  const { analyticsEvents, attestationResolvedEvents, user } = renderPrescribeWorkflow(
    {},
    { attestationStatus: 'NEEDS' }
  );

  await waitForSignatureAttestationModal();

  // Attestation Viewed must have fired already
  expect(analyticsEvents.find(isPageView('Signature Attestation Page Viewed'))).toBeDefined();
  // But resolved must not have fired yet
  expect(attestationResolvedEvents.length).toBe(0);

  await user.click(screen.getByRole('button', { name: /agree/i }));

  await waitFor(() => {
    expect(attestationResolvedEvents.length).toEqual(1);
  });
});

function renderPrescribeWorkflow(
  props: Partial<PrescribeWorkflowComponentProps> = {},
  options: { attestationStatus?: 'COMPLETE' | 'NEEDS' } = {}
) {
  if (options.attestationStatus === 'NEEDS') {
    // Per-test MSW overrides
    server.use(
      clinicalGql.query('GetCurrentUserSignatureAttestationStatus', () =>
        HttpResponse.json({
          data: {
            me: {
              signatureAttestationStatus: {
                __typename: 'NeedsSignatureAttestation',
                version: 'v1',
                content: 'Please attest to your signature'
              }
            }
          }
        })
      )
    );
  }

  const client = createTestClient();
  const clientStore = createTestClientStore(client);
  const eventListenerHost = document.createElement('div');

  const analyticsEvents: CustomEvent[] = [];
  const attestationResolvedEvents: Event[] = [];

  eventListenerHost.addEventListener('photon-analytics-track-event', (event: Event) => {
    analyticsEvents.push(event as CustomEvent);
  });

  eventListenerHost.addEventListener('photon-signature-attestation-resolved', (event: Event) => {
    attestationResolvedEvents.push(event);
  });

  document.body.append(eventListenerHost);

  const baseProps: PrescribeWorkflowComponentProps = {
    patientId: 'pat_123',
    hideSubmit: false,
    hideTemplates: false,
    hidePatientCard: false,
    enableOrder: false,
    enableMedHistory: false,
    enableMedHistoryLinks: false,
    enableMedHistoryRefillButton: false,
    enableCombineAndDuplicate: false,
    optionalPatientAddress: false,
    triggerSubmit: false,
    toastBuffer: 0,
    enableCoverageCheck: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: false
  };

  const mergedProps = { ...baseProps, ...props };

  const view = render(
    () => (
      <PhotonContext.Provider value={clientStore as never}>
        <SDKProvider client={client as never}>
          <GoogleServiceProvider>
            <PhotonPrescribeWorkflowComponent {...mergedProps} />
          </GoogleServiceProvider>
        </SDKProvider>
      </PhotonContext.Provider>
    ),
    { container: eventListenerHost }
  );

  return {
    ...view,
    analyticsEvents,
    attestationResolvedEvents,
    user: userEvent.setup()
  };
}

async function waitForSignatureAttestationModal() {
  await screen.findByText('Prescriber Signature Attestation');
}

async function waitForPrescribeForm() {
  await screen.findByText('Add Prescription', {}, { timeout: 3000 });
  await screen.findByRole('button', { name: /add to drafts/i });
}

async function addDraftPrescription(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/search for treatment/i), TREATMENT.id);
  await user.type(screen.getByLabelText(/quantity/i), '30');
  await user.selectOptions(screen.getByLabelText(/dispense unit/i), DISPENSE_UNIT.name);
  await user.type(screen.getByLabelText(/days supply/i), '10');
  await user.type(screen.getByLabelText(/^refills/i), '0');
  await user.type(
    screen.getByLabelText(/patient instructions/i),
    'Take one capsule by mouth daily'
  );
  await user.click(screen.getByRole('button', { name: /add to drafts/i }));
}

const isFieldInteraction = (filter: Record<string, unknown> = {}) => {
  return (event: CustomEvent) => {
    const detail = event.detail as AnalyticsDetail;
    if (detail.category !== 'fieldInteraction' || detail.name !== 'Field Interaction') {
      return false;
    }
    return Object.entries(filter).every(([key, value]) => detail[key] === value);
  };
};

const isPageView = (pageName: string, filter: Record<string, unknown> = {}) => {
  return (event: CustomEvent) => {
    const detail = event.detail as AnalyticsDetail;
    if (detail.category !== 'pageViewed' || detail.name !== pageName) {
      return false;
    }
    return Object.entries(filter).every(([key, value]) => detail[key] === value);
  };
};

const isCTA = (ctaName: string, filter: Record<string, unknown> = {}) => {
  return (event: CustomEvent) => {
    const detail = event.detail as AnalyticsDetail;
    if (detail.category !== 'ctaClicked' || detail.name !== ctaName) {
      return false;
    }
    return Object.entries(filter).every(([key, value]) => detail[key] === value);
  };
};
