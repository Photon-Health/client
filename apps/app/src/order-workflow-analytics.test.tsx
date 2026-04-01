import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { graphql, HttpResponse } from 'msw';
import { PhotonClient } from '@photonhealth/sdk';
import { defaultHandlers, PROVIDER, ORGANIZATION } from '@photonhealth/sdk/test-utils';
import { ProviderAnalyticsProvider } from './hooks/useProviderAnalytics';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { PatientForm } from './views/routes/NewPatient/PatientForm';

// ---------------------------------------------------------------------------
// MSW
// ---------------------------------------------------------------------------

const server = setupServer(
  ...defaultHandlers,

  graphql.query('PatientFormOrgSettingsQuery', () =>
    HttpResponse.json({
      data: {
        organization: {
          settings: { providerUx: { optionalPatientAddress: false } }
        }
      }
    })
  ),

  graphql.query('PrescriptionFormOrgSettingsQuery', () =>
    HttpResponse.json({
      data: {
        organization: {
          settings: {
            providerUx: {
              enablePrescribeToOrder: true,
              enableRxTemplates: true,
              enableDuplicateRxWarnings: false,
              enableTreatmentHistory: false,
              enablePatientRouting: true,
              enablePickupPharmacies: true,
              enableDeliveryPharmacies: false,
              optionalPatientAddress: false
            }
          }
        }
      }
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ---------------------------------------------------------------------------
// Mocks — only what can't go through MSW
// ---------------------------------------------------------------------------

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
vi.mock('./configs/providerAnalytics', () => ({
  getProviderAnalytics: () => ({ track: rudderTrackSpy, isInitialized: true })
}));

// @datadog/browser-rum and setInstrumentationUserContext are mocked globally in setupTests.ts

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('PrescriptionForm page view fires with orderWorkflowId, pageName, and context', async () => {
  renderPrescriptionForm({ patientId: 'pat_123' });

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Prescriptions Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        ),
        pageName: 'New Prescriptions',
        providerId: PROVIDER.id,
        providerEmail: PROVIDER.email,
        orgId: ORGANIZATION.id,
        orgName: ORGANIZATION.name,
        prefillPatientId: 'pat_123',
        weightUnit: 'lbs'
      })
    );
  });
});

test('Major CTA CustomEvent from web component reaches RudderStack enriched', async () => {
  renderPrescriptionForm({ patientId: 'pat_123' });

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
        orderWorkflowId: expect.stringMatching(/^[0-9a-f]{8}/),
        pageName: 'New Prescriptions',
        providerId: PROVIDER.id,
        orgId: ORGANIZATION.id,
        buttonText: 'Send',
        orderId: 'ord_abc'
      })
    );
  });
});

test('Minor CTA CustomEvent maps correctly with enrichment', async () => {
  renderPrescriptionForm({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();

  wrapper.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'ctaClicked',
        name: 'Minor CTA Clicked',
        ctaName: 'draft prescription added',
        draftPrescriptionSource: 'form',
        timestamp: new Date().toISOString()
      }
    })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'Minor CTA Clicked',
      expect.objectContaining({
        ctaName: 'draft prescription added',
        draftPrescriptionSource: 'form',
        orderWorkflowId: expect.stringMatching(/^[0-9a-f]{8}/)
      })
    );
  });
});

test('Field Interaction CustomEvent maps correctly with enrichment', async () => {
  renderPrescriptionForm({ patientId: 'pat_123' });

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
        formName: 'add_prescription_form',
        fieldName: 'dispenseQuantity',
        hasValue: true,
        isOptional: false,
        orderWorkflowId: expect.stringMatching(/^[0-9a-f]{8}/)
      })
    );
  });
});

test('orderWorkflowId persists across workflow routes', async () => {
  render(
    <MemoryRouter initialEntries={['/patients/new']}>
      <ProviderAnalyticsProvider>
        <Routes>
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
        </Routes>
      </ProviderAnalyticsProvider>
    </MemoryRouter>
  );

  // PatientForm renders <photon-patient-dialog> and sets open=true.
  // Simulate the Solid.js component dispatching the page view event.
  const patientDialog = await screen.findByTestId('patient-dialog', {}, { timeout: 3000 });

  patientDialog.dispatchEvent(
    new CustomEvent('photon-analytics-track-event', {
      bubbles: true,
      composed: true,
      detail: {
        category: 'pageViewed',
        name: 'New Patient Page Viewed',
        timestamp: new Date().toISOString()
      }
    })
  );

  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Patient Page Viewed',
      expect.objectContaining({ orderWorkflowId: expect.stringMatching(/^[0-9a-f]{8}/) })
    );
  });

  const patientPageId = rudderTrackSpy.mock.calls.find(
    (args: unknown[]) => args[0] === 'New Patient Page Viewed'
  )?.[1]?.orderWorkflowId;

  // Simulate "Create and Start Prescription" — navigates to /prescriptions/new
  patientDialog.dispatchEvent(
    new CustomEvent('photon-patient-created', {
      bubbles: true,
      composed: true,
      detail: { patientId: 'pat_123', createPrescription: true }
    })
  );

  // PrescriptionForm fires its own page view on mount
  await waitFor(() => {
    expect(rudderTrackSpy).toHaveBeenCalledWith(
      'New Prescriptions Page Viewed',
      expect.objectContaining({ orderWorkflowId: expect.stringMatching(/^[0-9a-f]{8}/) })
    );
  });

  const prescriptionPageId = rudderTrackSpy.mock.calls.find(
    (args: unknown[]) => args[0] === 'New Prescriptions Page Viewed'
  )?.[1]?.orderWorkflowId;

  // Same orderWorkflowId should persist across the workflow
  expect(patientPageId).toBe(prescriptionPageId);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPrescriptionForm(params: { patientId?: string } = {}) {
  const search = new URLSearchParams();
  if (params.patientId) search.set('patientId', params.patientId);

  return render(
    <MemoryRouter initialEntries={[`/prescriptions/new?${search.toString()}`]}>
      <ProviderAnalyticsProvider>
        <Routes>
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
        </Routes>
      </ProviderAnalyticsProvider>
    </MemoryRouter>
  );
}

async function findPrescribeWrapper(): Promise<HTMLElement> {
  return screen.findByTestId('multirx-form-wrapper', {}, { timeout: 3000 });
}
