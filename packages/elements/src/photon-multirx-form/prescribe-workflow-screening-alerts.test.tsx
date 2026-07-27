import { cleanup, screen, waitFor, within } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { generatePatient, generatePrescriptionScreeningAlert } from './test-utils/generators';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import {
  PrescriptionScreeningAlertSeverity,
  PrescriptionScreeningAlertType
} from '@photonhealth/sdk/dist/clinical-api/types';

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

  stubGoogleMaps();
});

beforeEach(() => {
  server.use(
    lambdasGql.query('patient', () => HttpResponse.json({ data: { patient: generatePatient() } })),
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: { patient: generatePatient({ preferredPharmacies: [], address: null }) }
      })
    )
  );
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
  await PatientStore.actions.reset();
});

afterAll(() => server.close());

// Drug-drug interaction between the drafted treatment and an existing Paxlovid Rx.
const drugAlert = generatePrescriptionScreeningAlert({
  type: PrescriptionScreeningAlertType.Drug,
  severity: PrescriptionScreeningAlertSeverity.Moderate,
  description:
    'Plasma concentrations and pharmacologic effects of alfuzosin may be increased by strong CYP3A4 inhibitors (eg, Paxlovid (300/100) Oral Tablet Therapy Pack 20 x 150 MG & 10 x 100MG). Coadministration is contraindicated.',
  involvedEntities: [
    {
      id: TREATMENT.id,
      name: TREATMENT.name,
      __typename: 'PrescriptionScreeningAlertInvolvedDraftedPrescription'
    },
    {
      id: 'rx_01KTMDYVZ5YDA73GMB4K32B5JA',
      name: 'Paxlovid',
      __typename: 'PrescriptionScreeningAlertInvolvedExistingPrescription'
    }
  ]
});

test('surfaces prescription screening alert between draft rx and existing rx', async () => {
  const screenPrescriptionsQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('ScreenDraftedPrescriptionsQuery', ({ variables }) => {
      screenPrescriptionsQuerySpy(variables);
      return HttpResponse.json({
        data: {
          prescriptionScreen: { alerts: [drugAlert] }
        }
      });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableSendToPatient: true,
      optionalPatientAddress: true
    });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await waitForDraftPrescription();
  await waitFor(
    () => {
      expect(screenPrescriptionsQuerySpy).toHaveBeenCalled();
      // Text is broken up with span elements so plain getByText doesn't work
      expect(
        screen.getByText(
          (_, element) =>
            element?.textContent === 'Moderate interaction with Paxlovid (Existing Rx)'
        )
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});

test('surfaces prescription screening alert between draft rx and diagnosis code', async () => {
  const alert = generatePrescriptionScreeningAlert({
    type: PrescriptionScreeningAlertType.Drug,
    description:
      'Plasma concentrations and pharmacologic effects of alfuzosin may be increased by strong CYP3A4 inhibitors (eg, Paxlovid (300/100) Oral Tablet Therapy Pack 20 x 150 MG & 10 x 100MG). Coadministration is contraindicated.',
    // Mark treatment that we are currently drafting a prescription for as an involvedEntity
    // TREATMENT is the object returned by MockMedicationSearchElement
    involvedEntities: [
      {
        id: TREATMENT.id,
        name: TREATMENT.name,
        __typename: 'PrescriptionScreeningAlertInvolvedDraftedPrescription'
      },
      {
        id: '93',
        name: 'Hypertension',
        __typename: 'PrescriptionScreeningAlertInvolvedCondition'
      }
    ],
    severity: PrescriptionScreeningAlertSeverity.Major
  });

  const screenPrescriptionsQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('ScreenDraftedPrescriptionsQuery', ({ variables }) => {
      screenPrescriptionsQuerySpy(variables);
      return HttpResponse.json({
        data: {
          prescriptionScreen: { alerts: [alert] }
        }
      });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableSendToPatient: true,
      optionalPatientAddress: true
    });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await waitForDraftPrescription();
  await waitFor(
    () => {
      expect(screenPrescriptionsQuerySpy).toHaveBeenCalled();
      // Text is broken up with span elements so plain getByText doesn't work
      expect(
        screen.getByText(
          (_, element) => element?.textContent === 'Major interaction with Hypertension (Condition)'
        )
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});

test('acknowledgement dialog groups alerts under their drafted prescription', async () => {
  server.use(
    clinicalGql.query('ScreenDraftedPrescriptionsQuery', () =>
      HttpResponse.json({ data: { prescriptionScreen: { alerts: [drugAlert] } } })
    )
  );

  const { waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription, user } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableSendToPatient: true,
      optionalPatientAddress: true
    });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await waitForDraftPrescription();

  // wait for the alert to load, then send to open the acknowledgement dialog
  await screen.findByText('Paxlovid', {}, { timeout: 3000 });
  await user.click(screen.getByRole('button', { name: /^send$/i }));
  const dialog = within(await screen.findByRole('dialog'));

  // the prescription name renders as the group header, with its alert grouped under it
  const header = dialog.getByText(TREATMENT.name);
  const group = within(header.parentElement as HTMLElement);
  expect(
    group.getByText(
      (_, element) => element?.textContent === 'Moderate interaction with Paxlovid (Existing Rx)'
    )
  ).toBeInTheDocument();
});
