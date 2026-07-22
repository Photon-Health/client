import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import {
  generateAddress,
  generateGqlSupervisor,
  generatePatient,
  generateSupervisorPrefill
} from './test-utils/generators';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';

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

test('does not show supervisor form for non-NP user', async () => {
  const meUserQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('MeUserQuery', ({ variables }) => {
      meUserQuerySpy(variables);
      return HttpResponse.json({
        data: {
          me: { credentials: 'MD', address: { state: 'GA' } }
        }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();
  await waitFor(
    () => {
      expect(meUserQuerySpy).toHaveBeenCalled();
      expect(screen.queryAllByText(/supervising physician/i)).toHaveLength(0);
      expect(screen.queryByRole('button', { name: /add supervisor/i })).toBeNull();
    },
    { timeout: 3000 }
  );
});

test('shows expanded supervisor form for user with no supervisors', async () => {
  const meUserQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('MeUserQuery', ({ variables }) => {
      meUserQuerySpy(variables);
      return HttpResponse.json({
        data: {
          me: { credentials: 'NP', address: { state: 'GA' } }
        }
      });
    })
  );

  const supervisorCardQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('SupervisorCardQuery', ({ variables }) => {
      supervisorCardQuerySpy(variables);
      return HttpResponse.json({
        data: {
          supervisors: [],
          mostRecentSupervisor: null
        }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();
  await waitFor(
    () => {
      expect(meUserQuerySpy).toHaveBeenCalled();
      expect(supervisorCardQuerySpy).toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: /add supervisor/i })).not.toBeNull();
    },
    { timeout: 3000 }
  );
});

test('shows required field missing error message when user submits incomplete supervisor form', async () => {
  const meUserQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('MeUserQuery', ({ variables }) => {
      meUserQuerySpy(variables);
      return HttpResponse.json({
        data: {
          me: { credentials: 'NP', address: { state: 'GA' } }
        }
      });
    })
  );

  const supervisorCardQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('SupervisorCardQuery', ({ variables }) => {
      supervisorCardQuerySpy(variables);
      return HttpResponse.json({
        data: {
          supervisors: [],
          mostRecentSupervisor: null
        }
      });
    })
  );

  const createSupervisorMutationSpy = vi.fn();
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', ({ variables }) => {
      createSupervisorMutationSpy(variables);
      return HttpResponse.json({
        data: {
          createSupervisor: {}
        }
      });
    })
  );

  const { waitForPrescribeForm, user } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();
  await waitFor(
    async () => {
      expect(meUserQuerySpy).toHaveBeenCalled();
      expect(supervisorCardQuerySpy).toHaveBeenCalled();
    },
    { timeout: 3000 }
  );

  await user.type(screen.getByLabelText(/first name/i), 'Jane');
  await user.click(screen.getByRole('button', { name: /add supervisor/i }));

  expect(screen.getByText('Last name is required')).toBeInTheDocument();
  expect(screen.getByText('Enter a valid 10-digit NPI')).toBeInTheDocument();
  expect(screen.getByText('Phone number is required')).toBeInTheDocument();
  expect(screen.getByText('Address line 1 is required')).toBeInTheDocument();
  expect(createSupervisorMutationSpy).not.toHaveBeenCalled();
});

test('allows user to submit complete supervisor form and selects new supervisor', async () => {
  const supervisorFill = generateSupervisorPrefill({
    address: generateAddress({ street2: 'Apt 2' }),
    phone: '+12125551234'
  });

  const meUserQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('MeUserQuery', ({ variables }) => {
      meUserQuerySpy(variables);
      return HttpResponse.json({
        data: {
          me: { credentials: 'NP', address: { state: 'GA' } }
        }
      });
    })
  );

  const supervisorCardQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('SupervisorCardQuery', ({ variables }) => {
      supervisorCardQuerySpy(variables);
      return HttpResponse.json({
        data: {
          supervisors: [],
          mostRecentSupervisor: null
        }
      });
    })
  );

  const createSupervisorMutationSpy = vi.fn();
  server.use(
    clinicalGql.mutation('CreateSupervisorMutation', ({ variables }) => {
      createSupervisorMutationSpy(variables);
      return HttpResponse.json({
        data: {
          createSupervisor: generateGqlSupervisor({
            id: 'sup_new',
            firstName: supervisorFill.firstName,
            lastName: supervisorFill.lastName,
            npi: supervisorFill.npi
          })
        }
      });
    })
  );

  const { waitForPrescribeForm, user } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();
  await waitFor(
    async () => {
      expect(meUserQuerySpy).toHaveBeenCalled();
      expect(supervisorCardQuerySpy).toHaveBeenCalled();
    },
    { timeout: 3000 }
  );

  await user.type(screen.getByLabelText(/first name/i), supervisorFill.firstName);
  await user.type(screen.getByLabelText(/last name/i), supervisorFill.lastName);
  await user.type(screen.getByLabelText(/^npi$/i), supervisorFill.npi);
  await user.type(screen.getByLabelText(/phone number/i), supervisorFill.phone);
  await user.type(screen.getByLabelText(/address line 1/i), supervisorFill.address.street1);
  await user.type(screen.getByLabelText(/address line 2/i), supervisorFill.address.street2!);
  await user.type(screen.getByLabelText(/city/i), supervisorFill.address.city);
  await user.selectOptions(screen.getByLabelText(/state/i), supervisorFill.address.state);
  await user.type(screen.getByLabelText(/zip code/i), supervisorFill.address.postalCode);
  await user.click(screen.getByRole('button', { name: /add supervisor/i }));

  await waitFor(
    () => {
      expect(createSupervisorMutationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: supervisorFill.firstName,
          lastName: supervisorFill.lastName,
          npi: supervisorFill.npi,
          phone: supervisorFill.phone,
          address: expect.objectContaining({
            street1: supervisorFill.address.street1,
            street2: supervisorFill.address.street2,
            city: supervisorFill.address.city,
            state: supervisorFill.address.state,
            postalCode: supervisorFill.address.postalCode,
            country: 'US'
          })
        })
      );
    },
    { timeout: 3000 }
  );
  // Wait for Solid to re-render
  await waitFor(
    () => {
      const supervisorInput = screen.getByRole('textbox', { name: /supervisor/i });
      // Should pre-select supervisor that was just created
      expect(supervisorInput).toHaveValue(
        `${supervisorFill.firstName} ${supervisorFill.lastName}, ${supervisorFill.npi}`
      );
    },
    { timeout: 3000 }
  );
});

test('shows list of existing supervisors for NP user, collapses supervisor form', async () => {
  const meUserQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('MeUserQuery', ({ variables }) => {
      meUserQuerySpy(variables);
      return HttpResponse.json({
        data: {
          me: { credentials: 'NP', address: { state: 'GA' } }
        }
      });
    })
  );

  const gqlSupervisor1 = generateGqlSupervisor();
  const gqlSupervisor2 = generateGqlSupervisor({
    id: 'sup_defaultTestId2',
    firstName: 'test-supervisor-fn2',
    lastName: 'test-supervisor-ln2',
    npi: 'test-supervisor-npi2'
  });

  const supervisorCardQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('SupervisorCardQuery', ({ variables }) => {
      supervisorCardQuerySpy(variables);
      return HttpResponse.json({
        data: {
          supervisors: [gqlSupervisor1, gqlSupervisor2],
          mostRecentSupervisor: gqlSupervisor2
        }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    enableOrder: true,
    enableSendToPatient: true,
    optionalPatientAddress: true
  });

  await waitForPrescribeForm();
  await waitFor(
    () => {
      expect(meUserQuerySpy).toHaveBeenCalled();
      expect(supervisorCardQuerySpy).toHaveBeenCalled();
    },
    { timeout: 3000 }
  );
  // Wait for Solid to re-render
  await waitFor(
    () => {
      const supervisorInput = screen.getByRole('textbox', { name: /supervisor/i });
      // Should pre-select mostRecentSupervisor
      expect(supervisorInput).toHaveValue(
        `${gqlSupervisor2.firstName} ${gqlSupervisor2.lastName}, ${gqlSupervisor2.npi}`
      );
    },
    { timeout: 3000 }
  );
});
