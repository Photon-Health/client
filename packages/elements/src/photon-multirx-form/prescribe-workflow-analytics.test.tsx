import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer, type SetupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, DISPENSE_UNIT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  // Needed when elements code invokes scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }

  stubGoogleMaps();
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
  useNeedsSignatureAttestation(server);
  const { analyticsEvents, waitForSignatureAttestationModal } = renderPrescribeWorkflow();

  await waitForSignatureAttestationModal();
  const event = analyticsEvents.find(isElementView('Signature Attestation Element Viewed'));
  expect(event?.detail).toEqual(
    expect.objectContaining({
      attestationVersion: 'v1',
      timestamp: expect.any(String)
    })
  );
});

test('Prescribe Workflow Viewed reports the element configuration', async () => {
  const { analyticsEvents } = renderPrescribeWorkflow({
    // Ids
    patientId: 'pat_123',
    catalogId: 'cat_1',
    groupId: 'grp_1',
    pharmacyId: 'phr_1',
    mailOrderIds: 'phr_mail_1,phr_mail_2',
    externalOrderId: 'ord_external_1',
    disableList: [
      { treatmentIds: ['trt_1', 'trt_2'], reason: 'Not covered' },
      { treatmentIds: ['trt_3'] }
    ],
    // Feature flags
    hideSubmit: true,
    hideTemplates: true,
    hidePatientCard: true,
    enableOrder: true,
    enableMedHistory: true,
    enableMedHistoryLinks: true,
    enableMedHistoryRefillButton: true,
    enableCombineAndDuplicate: true,
    enableCoverageCheck: true,
    enableLocalPickup: true,
    enableSendToPatient: true,
    enableDeliveryPharmacies: true,
    optionalPatientAddress: true,
    allowOffCatalogSearch: true,
    triggerSubmit: false,
    toastBuffer: 40,
    // Prescription prefills
    templateIds: 'tmp_1,tmp_2',
    templateOverrides: { tmp_1: { daysSupply: 30 } },
    prescriptionIds: 'rx_1',
    prescriptionOverrides: { rx_1: { daysSupply: 10 } },
    initialPrescriptions: [{ treatmentId: 'trt_1' }],
    // Other prefills
    supervisor: { npi: '1234567890' },
    diagnosisCodes: [{ code: 'A00' }],
    address: { street1: '106 N 7th St', city: 'Brooklyn', state: 'NY', postalCode: '11249' },
    additionalNotes: 'Take with food',
    weight: 180,
    weightUnit: 'lbs'
  });

  const event = analyticsEvents.find(isElementView('Prescribe Workflow Viewed'));
  expect(event?.detail).toEqual({
    name: 'Prescribe Workflow Viewed',
    category: 'elementViewed',
    timestamp: expect.any(String),
    // Ids are logged as-is
    patientId: 'pat_123',
    catalogId: 'cat_1',
    groupId: 'grp_1',
    pharmacyId: 'phr_1',
    mailOrderIds: 'phr_mail_1,phr_mail_2',
    hasExternalOrderId: true,
    // Disabled treatment ids are flattened out of the disable list
    hasDisableList: true,
    disableList: ['trt_1', 'trt_2', 'trt_3'],
    // Feature flags are logged as-is
    hideSubmit: true,
    hideTemplates: true,
    hidePatientCard: true,
    enableOrder: true,
    enableMedHistory: true,
    enableMedHistoryLinks: true,
    enableMedHistoryRefillButton: true,
    enableCombineAndDuplicate: true,
    enableCoverageCheck: true,
    enableLocalPickup: true,
    enableSendToPatient: true,
    enableDeliveryPharmacies: true,
    optionalPatientAddress: true,
    allowOffCatalogSearch: true,
    triggerSubmit: false,
    toastBuffer: 40,
    // Prescription prefills are reduced to primitives — no contents logged
    hasTemplateIdsPrefill: true,
    numTemplateIds: 2,
    hasTemplateOverridesPrefill: true,
    hasPrescriptionIdsPrefill: true,
    numPrescriptionIds: 1,
    hasPrescriptionOverridesPrefill: true,
    hasInitialPrescriptionsPrefill: true,
    numInitialPrescriptions: 1,
    // Other prefills we're interested in tracking
    hasSupervisorPrefill: true,
    hasDiagnosisCodesPrefill: true,
    hasAddressPrefill: true,
    additionalNotesLength: 'Take with food'.length,
    hasWeight: true,
    hasWeightUnit: true
  });
});

test('Prescribe Workflow Viewed reports absent and unparseable prefills', async () => {
  const { analyticsEvents } = renderPrescribeWorkflow({
    patientId: undefined,
    // solid-element leaves an attribute as a raw string when its JSON can't be parsed
    disableList: '[{ treatmentIds: }]',
    initialPrescriptions: '[{ treatmentId: }]',
    templateIds: '',
    weight: 0
  });

  const event = analyticsEvents.find(isElementView('Prescribe Workflow Viewed'));
  expect(event?.detail).toEqual(
    expect.objectContaining({
      patientId: undefined,
      catalogId: undefined,
      groupId: undefined,
      pharmacyId: undefined,
      mailOrderIds: undefined,
      hasExternalOrderId: false,
      // Passed in, but nothing could be parsed out of it
      hasDisableList: true,
      disableList: undefined,
      hasInitialPrescriptionsPrefill: true,
      numInitialPrescriptions: 0,
      // Empty string counts as not passed in
      hasTemplateIdsPrefill: false,
      numTemplateIds: 0,
      hasTemplateOverridesPrefill: false,
      hasPrescriptionIdsPrefill: false,
      numPrescriptionIds: 0,
      hasPrescriptionOverridesPrefill: false,
      hasSupervisorPrefill: false,
      hasDiagnosisCodesPrefill: false,
      hasAddressPrefill: false,
      additionalNotesLength: 0,
      // A weight of 0 still counts as passed in
      hasWeight: true,
      hasWeightUnit: false
    })
  );
});

test('field interactions', async () => {
  const { analyticsEvents, user, waitForPrescribeForm } = renderPrescribeWorkflow();

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
  const { analyticsEvents, user, waitForPrescribeForm } = renderPrescribeWorkflow({
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
    isFieldInteraction({ fieldName: 'activeTab', value: 'Local Pickup' })
  );
  expect(localPickupEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      fieldName: 'activeTab',
      value: 'Local Pickup',
      timestamp: expect.any(String)
    })
  );

  await user.click(screen.getByText('Mail Order'));
  const mailOrderEvent = analyticsEvents.find(
    isFieldInteraction({ fieldName: 'activeTab', value: 'Mail Order' })
  );
  expect(mailOrderEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      fieldName: 'activeTab',
      value: 'Mail Order',
      timestamp: expect.any(String)
    })
  );

  // Click back to "Send to Patient" tab
  await user.click(screen.getByText('Send to Patient'));
  const sendToPatientEvent = analyticsEvents.find(
    isFieldInteraction({ fieldName: 'activeTab', value: 'Send to Patient' })
  );
  expect(sendToPatientEvent?.detail).toEqual(
    expect.objectContaining({
      formName: 'select_pharmacy',
      fieldName: 'activeTab',
      value: 'Send to Patient',
      timestamp: expect.any(String)
    })
  );
});

test('Send Order CTAs', async () => {
  const {
    analyticsEvents,
    user,
    waitForPrescribeForm,
    addDraftPrescription,
    waitForDraftPrescription
  } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();

  // 1. Add a draft prescription
  await addDraftPrescription();

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
  await waitForDraftPrescription();

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
  useNeedsSignatureAttestation(server);
  const { analyticsEvents, user, waitForSignatureAttestationModal } = renderPrescribeWorkflow();

  await waitForSignatureAttestationModal();

  // Assert page view fired
  expect(analyticsEvents.find(isElementView('Signature Attestation Element Viewed'))).toBeDefined();

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
  useNeedsSignatureAttestation(server);
  const { attestationResolvedEvents, user, waitForSignatureAttestationModal } =
    renderPrescribeWorkflow();

  await waitForSignatureAttestationModal();

  // Must not have fired yet — user hasn't agreed
  expect(attestationResolvedEvents.length).toBe(0);

  await user.click(screen.getByRole('button', { name: /agree/i }));

  await waitFor(() => {
    expect(attestationResolvedEvents.length).toEqual(1);
  });
});

test('Signature Attestation Element Viewed fires before photon-signature-attestation-resolved when attestation required', async () => {
  useNeedsSignatureAttestation(server);
  const { analyticsEvents, attestationResolvedEvents, user, waitForSignatureAttestationModal } =
    renderPrescribeWorkflow();

  await waitForSignatureAttestationModal();

  // Attestation Viewed must have fired already
  expect(analyticsEvents.find(isElementView('Signature Attestation Element Viewed'))).toBeDefined();
  // But resolved must not have fired yet
  expect(attestationResolvedEvents.length).toBe(0);

  await user.click(screen.getByRole('button', { name: /agree/i }));

  await waitFor(() => {
    expect(attestationResolvedEvents.length).toEqual(1);
  });
});

const isFieldInteraction = (filter: Record<string, unknown> = {}) => {
  return (event: CustomEvent) => {
    const detail = event.detail as AnalyticsDetail;
    if (detail.category !== 'fieldInteraction' || detail.name !== 'Field Interaction') {
      return false;
    }
    return Object.entries(filter).every(([key, value]) => detail[key] === value);
  };
};

const isElementView = (pageName: string, filter: Record<string, unknown> = {}) => {
  return (event: CustomEvent) => {
    const detail = event.detail as AnalyticsDetail;
    if (detail.category !== 'elementViewed' || detail.name !== pageName) {
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

function useNeedsSignatureAttestation(mswServer: SetupServer) {
  mswServer.use(
    clinicalGql.query('GetCurrentUserSignatureAttestationStatus', () =>
      HttpResponse.json({
        data: {
          me: {
            __typename: 'User',
            id: 'usr_1',
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
