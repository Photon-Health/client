import { cleanup, render, waitFor } from '@solidjs/testing-library';
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
import { defaultHandlers, lambdasGql, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  window.HTMLElement.prototype.scrollIntoView = vi.fn();

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

type PrescriptionInput = {
  templateId?: string;
  patientId?: string;
  notes?: string;
};

test('additionalNotes are merged into prescriptions prefilled from templateIds', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptions.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            __typename: 'Prescription',
            id: `rx_tpl_${i}`,
            externalId: null,
            dispenseAsWritten: false,
            dispenseQuantity: 30,
            dispenseUnit: 'Tablet',
            fillsAllowed: 1,
            daysSupply: 30,
            instructions: 'Take one daily',
            notes: p.notes ?? '',
            doNotFillBeforeDate: null,
            diagnoses: [],
            treatment: TREATMENT
          }))
        }
      });
    })
  );

  renderPrescribeWorkflow({
    templateIds: 'tpl_1',
    templateOverrides: { tpl_1: { notes: 'Template override note' } },
    additionalNotes: 'Clinical additional note from host app'
  });

  await waitFor(
    () => {
      expect(capturedPrescriptions).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  const [sent] = capturedPrescriptions;
  expect(sent.templateId).toBe('tpl_1');
  // Bug: additionalNotes never reach the CreatePrescriptions mutation for
  // template-prefilled rxs — only templateOverrides notes make it through.
  expect(sent.notes).toContain('Clinical additional note from host app');
});

function renderPrescribeWorkflow(props: Partial<PrescribeWorkflowComponentProps> = {}) {
  const client = createTestClient();
  const clientStore = createTestClientStore(client);
  const host = document.createElement('div');
  document.body.append(host);

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

  return render(
    () => (
      <PhotonContext.Provider value={clientStore as never}>
        <SDKProvider client={client as never}>
          <GoogleServiceProvider>
            <PhotonPrescribeWorkflowComponent {...{ ...baseProps, ...props }} />
          </GoogleServiceProvider>
        </SDKProvider>
      </PhotonContext.Provider>
    ),
    { container: host }
  );
}
