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
import { clinicalGql, defaultHandlers, DISPENSE_UNIT, TREATMENT } from '../test-utils/msw-handlers';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

// todo: remove this MockMedicationSearchElement
class MockMedicationSearchElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') return;
    this.dataset.initialized = 'true';

    const label = this.getAttribute('label') || 'Search for Treatment';
    const wrapper = document.createElement('label');
    wrapper.textContent = label;

    const select = document.createElement('select');
    select.setAttribute('aria-label', label);

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select treatment';
    select.append(placeholder);

    const option = document.createElement('option');
    option.value = TREATMENT.id;
    option.textContent = TREATMENT.name;
    select.append(option);

    select.addEventListener('change', () => {
      if (!select.value) {
        this.dispatchEvent(
          new CustomEvent('photon-treatment-unselected', { bubbles: true, composed: true })
        );
        return;
      }
      this.dispatchEvent(
        new CustomEvent('photon-search-text-changed', {
          bubbles: true,
          composed: true,
          detail: { text: TREATMENT.name }
        })
      );
      this.dispatchEvent(
        new CustomEvent('photon-treatment-selected', {
          bubbles: true,
          composed: true,
          detail: { data: TREATMENT, catalogId: 'cat_123' }
        })
      );
    });

    wrapper.append(select);
    this.append(wrapper);
  }
}

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

  const event = findAnalyticsEvent(
    analyticsEvents,
    (d) => d.category === 'pageViewed' && d.name === 'Signature Attestation Viewed'
  );
  expect(event?.detail).toEqual(
    expect.objectContaining({
      category: 'pageViewed',
      name: 'Signature Attestation Viewed',
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
  const fields = findAllAnalyticsEvents(
    analyticsEvents,
    (d) => d.category === 'fieldInteraction' && d.name === 'Field Interaction'
  ).map((e) => ({
    fieldName: (e.detail as AnalyticsDetail).fieldName,
    isOptional: (e.detail as AnalyticsDetail).isOptional,
    formName: (e.detail as AnalyticsDetail).formName
  }));

  expect(fields).toEqual(
    expect.arrayContaining([
      { fieldName: 'dispenseQuantity', isOptional: false, formName: 'add_prescription_form' },
      { fieldName: 'dispenseUnit', isOptional: false, formName: 'add_prescription_form' },
      { fieldName: 'daysSupply', isOptional: true, formName: 'add_prescription_form' },
      { fieldName: 'refills', isOptional: true, formName: 'add_prescription_form' },
      { fieldName: 'instructions', isOptional: false, formName: 'add_prescription_form' },
      { fieldName: 'pharmacy_notes', isOptional: true, formName: 'add_prescription_form' },
      { fieldName: 'dispenseAsWritten', isOptional: true, formName: 'add_prescription_form' },
      { fieldName: 'addToTemplates', isOptional: true, formName: 'add_prescription_form' }
    ])
  );

  // Verify each has the required common shape
  for (const event of findAllAnalyticsEvents(
    analyticsEvents,
    (d) => d.category === 'fieldInteraction'
  )) {
    const detail = event.detail as AnalyticsDetail;
    expect(detail).toEqual(
      expect.objectContaining({
        category: 'fieldInteraction',
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        timestamp: expect.any(String)
      })
    );
  }
});

test('CTAs', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();

  // 1. Add a draft prescription
  await addDraftPrescription(user);

  const draftAdded = findAnalyticsEvent(
    analyticsEvents,
    (d) =>
      d.category === 'ctaClicked' &&
      d.name === 'Minor CTA Clicked' &&
      d.ctaName === 'draft prescription added'
  );
  expect(draftAdded?.detail).toEqual(
    expect.objectContaining({
      category: 'ctaClicked',
      name: 'Minor CTA Clicked',
      ctaName: 'draft prescription added',
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
    expect(
      findAnalyticsEvent(
        analyticsEvents,
        (d) => d.category === 'ctaClicked' && d.name === 'Order Sent'
      )
    ).toBeDefined();
  });

  const orderSent = findAnalyticsEvent(
    analyticsEvents,
    (d) => d.category === 'ctaClicked' && d.name === 'Order Sent'
  );
  expect(orderSent?.detail).toEqual(
    expect.objectContaining({
      category: 'ctaClicked',
      name: 'Order Sent',
      buttonText: 'Send',
      orderId: 'ord_abc',
      prescriptionCount: 1,
      fulfillmentType: 'SEND_TO_PATIENT',
      isCombinedOrder: false,
      timestamp: expect.any(String)
    })
  );
});

test('attestation CTAs — Attestation Canceled', async () => {
  const { analyticsEvents, user } = renderPrescribeWorkflow({}, { attestationStatus: 'NEEDS' });

  await waitForSignatureAttestationModal();

  // Assert page view fired
  expect(
    findAnalyticsEvent(
      analyticsEvents,
      (d) => d.category === 'pageViewed' && d.name === 'Signature Attestation Viewed'
    )
  ).toBeDefined();

  // Click cancel
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  const canceled = findAnalyticsEvent(
    analyticsEvents,
    (d) => d.category === 'ctaClicked' && d.name === 'Attestation Canceled'
  );
  expect(canceled?.detail).toEqual(
    expect.objectContaining({
      category: 'ctaClicked',
      name: 'Attestation Canceled',
      buttonText: 'Cancel',
      timestamp: expect.any(String)
    })
  );
});

function renderPrescribeWorkflow(
  props: Partial<PrescribeWorkflowComponentProps> = {},
  options: { attestationStatus?: 'COMPLETE' | 'NEEDS' } = {}
) {
  // Per-test MSW overrides
  if (options.attestationStatus === 'NEEDS') {
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

  eventListenerHost.addEventListener('photon-analytics-track-event', (event: Event) => {
    analyticsEvents.push(event as CustomEvent);
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
    user: userEvent.setup()
  };
}

function findAnalyticsEvent(
  analyticsEvents: CustomEvent[],
  matcher: (detail: AnalyticsDetail) => boolean
) {
  return analyticsEvents.find((event) => matcher(event.detail as AnalyticsDetail));
}

function findAllAnalyticsEvents(
  analyticsEvents: CustomEvent[],
  matcher: (detail: AnalyticsDetail) => boolean
) {
  return analyticsEvents.filter((event) => matcher(event.detail as AnalyticsDetail));
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
