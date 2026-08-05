import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { graphql, HttpResponse } from 'msw';
import { defaultHandlers, ORGANIZATION, PROVIDER } from '@photonhealth/sdk/test-utils';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { PatientForm } from './views/routes/NewPatient/PatientForm';
import { OrganizationSettings } from './gql/graphql';
import { setupHarness } from './test-utils';

const testProviderUxSettings = {
  enablePrescribeToOrder: true,
  enableRxTemplates: true,
  enableDuplicateRxWarnings: false,
  enableTreatmentHistory: false,
  enablePatientRouting: true,
  enablePickupPharmacies: true,
  enableDeliveryPharmacies: false,
  enableWebAppPrescribe: true,
  optionalPatientAddress: false
};

const server = setupServer(
  ...defaultHandlers,
  createPatientFormOrgSettingsHandler(testProviderUxSettings),
  createPrescriptionFormOrgSettingsHandler(testProviderUxSettings)
);

const { trackSpy, identifySpy, renderWithProviders } = setupHarness();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());

const expectedOrderWorkflowIdRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test('New Prescriptions Page Viewed does not fire before Signature Attestation agreement', async () => {
  renderApp({ patientId: 'pat_123' });

  // Wait for provider analytics to be ready (identify fires when data loads)
  await waitFor(() => {
    expect(identifySpy).toHaveBeenCalled();
  });

  // Page view must NOT have fired yet — it should wait for photon-signature-attestation-resolved
  expect(trackSpy).not.toHaveBeenCalledWith('New Prescriptions Page Viewed', expect.anything());
});

test('New Prescriptions Page Viewed fires after Signature attestation status is resolved, with correct context', async () => {
  renderApp({ patientId: 'pat_123' });

  const wrapper = await findPrescribeWrapper();
  wrapper.dispatchEvent(
    new CustomEvent('photon-signature-attestation-resolved', { bubbles: true, composed: true })
  );

  await waitFor(() => {
    expect(identifySpy).toHaveBeenCalledWith(PROVIDER.email, {
      email: PROVIDER.email,
      user_id: PROVIDER.id,
      name: PROVIDER.name.full,
      org_id: ORGANIZATION.id,
      customer_id: ORGANIZATION.customer.id
    });
    expect(trackSpy).toHaveBeenCalledWith(
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

test('orderWorkflowId persists across workflow routes', async () => {
  renderApp({ patientId: 'pat_123' }, '/patients/new');

  await simulatePatientPageViewEvent('New Patient Page Viewed');

  await waitFor(() => {
    expect(trackSpy).toHaveBeenCalledWith(
      'New Patient Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });

  const patientPageOrderWorkflowId = (
    trackSpy.mock.calls.find((args: unknown[]) => args[0] === 'New Patient Page Viewed')?.[1] as
      | { orderWorkflowId?: string }
      | undefined
  )?.orderWorkflowId;

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
    expect(trackSpy).toHaveBeenCalledWith(
      'New Prescriptions Page Viewed',
      expect.objectContaining({
        orderWorkflowId: expect.stringMatching(expectedOrderWorkflowIdRegex)
      })
    );
  });

  const prescriptionPageOrderWorkflowId = (
    trackSpy.mock.calls.find(
      (args: unknown[]) => args[0] === 'New Prescriptions Page Viewed'
    )?.[1] as { orderWorkflowId?: string } | undefined
  )?.orderWorkflowId;

  expect(patientPageOrderWorkflowId).toBe(prescriptionPageOrderWorkflowId);
});

function renderApp(params: { patientId?: string } = {}, initialPageOverride?: string) {
  const search = new URLSearchParams();
  if (params.patientId) search.set('patientId', params.patientId);

  const initialPage = initialPageOverride
    ? initialPageOverride
    : `/prescriptions/new?${search.toString()}`;
  return renderWithProviders(
    <Routes>
      <Route path="/patients/new" element={<PatientForm />} />
      <Route path="/prescriptions/new" element={<PrescriptionForm />} />
    </Routes>,
    { initialEntries: [initialPage] }
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
        category: 'elementViewed',
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
