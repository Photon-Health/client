import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { graphql, HttpResponse } from 'msw';
import { PhotonClient } from '@photonhealth/sdk';
import { defaultHandlers, ORGANIZATION, PROVIDER } from '@photonhealth/sdk/test-utils';
import { ProviderAnalyticsProvider } from './hooks/useProviderAnalytics';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { PatientForm } from './views/routes/NewPatient/PatientForm';
import { OrganizationSettings } from './gql/graphql';

const testProviderUxSettings = {
  enablePrescribeToOrder: true,
  enableRxTemplates: true,
  enableDuplicateRxWarnings: false,
  enableTreatmentHistory: false,
  enablePatientRouting: true,
  enablePickupPharmacies: true,
  enableDeliveryPharmacies: false,
  optionalPatientAddress: false
};

const server = setupServer(
  ...defaultHandlers,
  createPatientFormOrgSettingsHandler(testProviderUxSettings),
  createPrescriptionFormOrgSettingsHandler(testProviderUxSettings)
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());

// Mocking only what can't go through MSW
const client = new PhotonClient({ clientId: 'test', env: 'tau' });
client.authentication.getAccessToken = vi.fn(async () => 'test-token');
vi.mock('@photonhealth/react', () => ({
  usePhoton: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { org_id: 'org_1' },
    clinicalClient: client.apolloClinical
  })
}));

const rudderTrackSpy = vi.fn();
const rudderIdentifySpy = vi.fn();
vi.mock('./configs/providerAnalytics', () => ({
  getProviderAnalytics: () => ({
    track: rudderTrackSpy,
    isInitialized: true,
    identify: rudderIdentifySpy
  })
}));

const expectedOrderWorkflowIdRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test('New Prescriptions Page Viewed does not fire before Signature Attestation agreement', async () => {
  renderApp({ patientId: 'pat_123' });

  // Wait for provider analytics to be ready (identify fires when data loads)
  await waitFor(() => {
    expect(rudderIdentifySpy).toHaveBeenCalled();
  });

  // Page view must NOT have fired yet — it should wait for photon-signature-attestation-resolved
  expect(rudderTrackSpy).not.toHaveBeenCalledWith(
    'New Prescriptions Page Viewed',
    expect.anything()
  );
});

test('New Prescriptions Page Viewed fires after Signature attestation status is resolved, with correct context', async () => {
  renderApp({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();
  wrapper.dispatchEvent(
    new CustomEvent('photon-signature-attestation-resolved', { bubbles: true, composed: true })
  );

  await waitFor(() => {
    expect(rudderIdentifySpy).toHaveBeenCalledWith(PROVIDER.id, {
      email: PROVIDER.email,
      name: PROVIDER.name.full,
      org_id: ORGANIZATION.id,
      customer_id: ORGANIZATION.customer.id
    });
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Prescriptions Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex),
        pageName: 'New Prescriptions',
        providerId: PROVIDER.id,
        providerEmail: PROVIDER.email,
        orgId: ORGANIZATION.id,
        orgName: ORGANIZATION.name,
        prefillPatientId: 'pat_123'
      })
    );
  });
});

test('Major CTA events from web component reach RudderStack track', async () => {
  renderApp({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();
  wrapper.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'ctaClicked',
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: 'ord_abc',
        prescriptionCount: 1,
        fulfillmentType: 'SEND_TO_PATIENT',
        hasPreferredPharmacy: false,
        setAsPreferred: false,
        pharmacyId: null,
        isCombinedOrder: false,
        timestamp: new Date().toISOString()
      }
    })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'Order Sent',
      expect.objectContaining({
        category: 'ctaClicked',
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex),
        pageName: 'New Prescriptions',
        providerId: PROVIDER.id,
        orgId: ORGANIZATION.id,
        buttonText: 'Send',
        orderId: 'ord_abc',
        prescriptionCount: 1,
        fulfillmentType: 'SEND_TO_PATIENT',
        hasPreferredPharmacy: false,
        setAsPreferred: false,
        pharmacyId: null,
        isCombinedOrder: false
      })
    );
  });
});

test('CTA events map correctly with orderWorkflowId and category', async () => {
  renderApp({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();

  wrapper.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'ctaClicked',
        name: 'Draft Prescription Added',
        draftPrescriptionSource: 'form',
        timestamp: new Date().toISOString()
      }
    })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'Draft Prescription Added',
      expect.objectContaining({
        category: 'ctaClicked',
        draftPrescriptionSource: 'form',
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });
});

test('Field Interaction CustomEvent maps correctly with enrichment', async () => {
  renderApp({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();

  wrapper.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'fieldInteraction',
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        fieldName: 'dispenseQuantity',
        hasValue: true,
        isOptional: false,
        timestamp: new Date().toISOString()
      }
    })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'Field Interaction',
      expect.objectContaining({
        category: 'fieldInteraction',
        formName: 'add_prescription_form',
        fieldName: 'dispenseQuantity',
        hasValue: true,
        isOptional: false,
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });
});

test('orderWorkflowId persists across workflow routes', async () => {
  renderApp({ patientId: 'pat_123' }, '/patients/new');

  await simulatePatientPageViewEvent('New Patient Page Viewed');

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Patient Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });

  const patientPageOrderWorkflowId = rudderTrackSpy.mock.calls.find(
    (args: unknown[]) => args[0] === 'New Patient Page Viewed'
  )?.[1]?.orderWorkflowId;

  // Simulate "Create and Start Prescription" — navigates to /prescriptions/new
  const patientDialog = await findPatientDialogWrapper();
  patientDialog.dispatchEvent(
    new CustomEvent('photon-patient-created', {
      bubbles: true,
      composed: true,
      detail: { patientId: 'pat_123', createPrescription: true }
    })
  );

  // Simulate the Solid-side attestation resolving, which triggers New Prescriptions Page Viewed
  const prescribeWrapper = await findPrescribeWrapper();
  prescribeWrapper.dispatchEvent(
    new CustomEvent('photon-signature-attestation-resolved', { bubbles: true, composed: true })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Prescriptions Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });

  const prescriptionPageOrderWorkflowId = rudderTrackSpy.mock.calls.find(
    (args: unknown[]) => args[0] === 'New Prescriptions Page Viewed'
  )?.[1]?.orderWorkflowId;

  expect(patientPageOrderWorkflowId).toBe(prescriptionPageOrderWorkflowId);
});

function renderApp(params: { patientId?: string } = {}, initialPageOverride?: string) {
  const search = new URLSearchParams();
  if (params.patientId) search.set('patientId', params.patientId);

  const initialPage = initialPageOverride
    ? initialPageOverride
    : `/prescriptions/new?${search.toString()}`;
  return render(
    <MemoryRouter initialEntries={[initialPage]}>
      <ProviderAnalyticsProvider>
        <Routes>
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
        </Routes>
      </ProviderAnalyticsProvider>
    </MemoryRouter>
  );
}

async function simulatePatientPageViewEvent(pageName: string) {
  // Simulate the Solid.js patient-dialog component dispatching the page view event because WebComponent is inert in jsdom
  const patientDialog = await findPatientDialogWrapper();
  patientDialog.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'pageViewed',
        name: pageName
      }
    })
  );
}

async function findPatientDialogWrapper(): Promise<HTMLElement> {
  return screen.findByTestId('patient-dialog', {}, { timeout: 3000 });
}

async function findPrescribeWrapper(): Promise<HTMLElement> {
  return screen.findByTestId('multirx-form-wrapper', {}, { timeout: 3000 });
}

function createPatientFormOrgSettingsHandler(settings: OrganizationSettings['providerUx']) {
  return graphql.query('PatientFormOrgSettingsQuery', () =>
    HttpResponse.json({
      data: {
        organization: {
          settings
        }
      }
    })
  );
}

function createPrescriptionFormOrgSettingsHandler(settings: OrganizationSettings['providerUx']) {
  return graphql.query('PrescriptionFormOrgSettingsQuery', () =>
    HttpResponse.json({
      data: {
        organization: {
          settings
        }
      }
    })
  );
}
