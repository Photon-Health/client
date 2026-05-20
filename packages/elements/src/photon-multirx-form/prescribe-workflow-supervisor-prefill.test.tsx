import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { GraphQLError } from 'graphql';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import {
  generateAddress,
  generateGqlSupervisor,
  generatePatient,
  generateSupervisorJson,
  generateUser
} from './test-utils/generators';
import { stubGoogleMaps } from './test-utils/stub-google-maps';

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

test('creates supervisor and attaches to order', async () => {
  const createSupervisorMutationSpy = vi.fn();
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', ({ variables }) => {
      createSupervisorMutationSpy(variables);
      return HttpResponse.json({
        data: {
          createSupervisor: generateGqlSupervisor({
            id: 'sup_prefilled'
          })
        }
      });
    })
  );

  const createOrderSpy = vi.fn();
  server.use(
    lambdasGql.mutation('createOrder', ({ variables }) => {
      createOrderSpy(variables);
      return HttpResponse.json({
        data: { createOrder: { __typename: 'Order', id: 'ord_abc' } }
      });
    })
  );

  const supervisorPrefill = generateSupervisorJson({
    firstName: 'test-fn',
    lastName: 'test-ln',
    address: generateAddress({
      country: 'test-country',
      city: 'test-city',
      postalCode: 'test-zip',
      state: 'test-state',
      street1: 'test-street1'
    }),
    npi: 'test-npi',
    phone: 'test-phone'
  });

  const { user, waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true,
    supervisor: supervisorPrefill
  });

  await waitForPrescribeForm();

  await waitFor(
    () => {
      expect(createSupervisorMutationSpy).toHaveBeenCalledWith(
        expect.objectContaining(JSON.parse(supervisorPrefill))
      );
    },
    { timeout: 3000 }
  );

  await addDraftPrescription();
  await screen.findByText(TREATMENT.name, {}, { timeout: 3000 });

  await user.click(screen.getByRole('button', { name: /^send$/i }));

  await waitFor(
    () => {
      expect(createOrderSpy).toHaveBeenCalledWith(
        expect.objectContaining({ supervisorId: 'sup_prefilled' })
      );
    },
    { timeout: 3000 }
  );
});

test('creates supervisor and does not show visually to user', async () => {
  server.use(
    clinicalGql.query('MeUserQuery', () =>
      HttpResponse.json({
        // don't assume users will have a credentials that requires a Supervisor
        // Supervisor can be passed in by customer to force set the supervisor.
        data: { me: generateUser({ credentials: null }) }
      })
    ),
    clinicalGql.mutation('CreateSupervisorMutation', () =>
      HttpResponse.json({
        data: {
          createSupervisor: generateGqlSupervisor({
            id: 'sup_prefilled22'
          })
        }
      })
    )
  );

  const { waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true,
    supervisor: generateSupervisorJson()
  });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await screen.findByText(TREATMENT.name, {}, { timeout: 3000 });

  // None of the SupervisorCard UI surfaces, because user does not have NP/PA credentials
  expect(screen.queryAllByText(/supervising physician/i)).toHaveLength(0);
  expect(screen.queryByLabelText(/^supervisor$/i)).toBeNull();
  expect(screen.queryByRole('button', { name: /add supervisor/i })).toBeNull();
  expect(screen.queryByRole('button', { name: /add new/i })).toBeNull();
});

test('emits supervisor error event when JSON is malformed', async () => {
  const createSupervisorSpy = vi.fn();
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', () => {
      createSupervisorSpy();
      return HttpResponse.json({ data: { createSupervisor: null } });
    })
  );

  const { supervisorErrorEvents } = renderPrescribeWorkflow({
    enableOrder: true,
    supervisor: '{not valid json'
  });

  await waitFor(() => {
    expect(supervisorErrorEvents.length).toBeGreaterThan(0);
  });

  expect(supervisorErrorEvents[0].detail).toEqual(
    expect.objectContaining({
      errors: expect.arrayContaining(['Invalid supervisor json passed in'])
    })
  );

  // Bad JSON must not reach the API.
  expect(createSupervisorSpy).not.toHaveBeenCalled();

  // Errors must NOT surface to the prescriber.
  expect(screen.queryByRole('alert')).toBeNull();
});

test('emits supervisor error event when required fields are missing', async () => {
  const createSupervisorSpy = vi.fn();
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', () => {
      createSupervisorSpy();
      return HttpResponse.json({ data: { createSupervisor: null } });
    })
  );

  const supervisorWithoutPhone = generateSupervisorJson({
    phone: undefined
  });
  const { supervisorErrorEvents } = renderPrescribeWorkflow({
    enableOrder: true,
    supervisor: supervisorWithoutPhone
  });

  await waitFor(() => {
    expect(supervisorErrorEvents.length).toBeGreaterThan(0);
  });

  const detail = supervisorErrorEvents[0].detail as { errors: string[] };
  expect(Array.isArray(detail.errors)).toBe(true);
  expect(detail.errors.length).toBeGreaterThan(0);

  expect(createSupervisorSpy).not.toHaveBeenCalled();

  expect(screen.queryByRole('alert')).toBeNull();
});

test('emits supervisor error event when CreateSupervisorMutation fails', async () => {
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', () =>
      HttpResponse.json({
        errors: [new GraphQLError('Supervisor creation failed')]
      })
    )
  );

  const { waitForPrescribeForm, supervisorErrorEvents } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true,
    supervisor: generateSupervisorJson()
  });

  await waitForPrescribeForm();

  await waitFor(
    () => {
      expect(supervisorErrorEvents.length).toBeGreaterThan(0);
    },
    { timeout: 3000 }
  );

  const detail = supervisorErrorEvents[supervisorErrorEvents.length - 1].detail as {
    errors: string[];
  };
  expect(detail.errors.some((e) => /supervisor creation failed/i.test(e))).toBe(true);

  // Server-side failure must not surface to the prescriber.
  expect(screen.queryByRole('alert')).toBeNull();
});
