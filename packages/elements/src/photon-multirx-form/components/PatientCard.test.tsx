import { cleanup, render, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import {
  GoogleServiceProvider,
  PhotonContext,
  PrescribeEventDispatchProvider,
  SDKProvider
} from '@photonhealth/components';
import { defaultHandlers, lambdasGql, PATIENT } from '@photonhealth/sdk/test-utils';
import { createTestClient, createTestClientStore } from '../../test-utils/createTestClient';
import { PatientCard } from './PatientCard';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

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
});

afterAll(() => server.close());

type PatientCardProps = Parameters<typeof PatientCard>[0];

function renderPatientCard(props: Partial<PatientCardProps> = {}) {
  const client = createTestClient();
  const clientStore = createTestClientStore(client);
  const actions = {
    registerValidator: vi.fn(),
    updateFormValue: vi.fn()
  };
  const store: Record<string, any> = {
    patient: { value: undefined },
    address: { value: undefined }
  };

  const mergedProps: PatientCardProps = {
    store,
    actions,
    client: clientStore as never,
    ...props
  };

  render(() => (
    <PhotonContext.Provider value={clientStore as never}>
      <SDKProvider client={client as never}>
        <GoogleServiceProvider>
          <PrescribeEventDispatchProvider>
            <PatientCard {...mergedProps} />
          </PrescribeEventDispatchProvider>
        </GoogleServiceProvider>
      </SDKProvider>
    </PhotonContext.Provider>
  ));

  return { actions, store, client, clientStore };
}

describe('without patientId', () => {
  test('shows patient select section', () => {
    renderPatientCard();

    screen.getByText('Select Patient');
    screen.getByPlaceholderText('Select patient...');
  });

  test('does not show patient info', () => {
    renderPatientCard();

    expect(screen.queryByText('Patient Info')).toBeNull();
  });

  test('selecting a patient from the dropdown shows patient info', async () => {
    server.use(
      lambdasGql.query('patients', () => HttpResponse.json({ data: { patients: [PATIENT] } }))
    );
    const user = userEvent.setup();
    renderPatientCard();

    await user.click(screen.getByPlaceholderText('Select patient...'));
    await user.click(await screen.findByText(PATIENT.name.full));

    await screen.findByText('Patient Info');
  });
});

describe('with patientId', () => {
  test('hides the patient select section', () => {
    renderPatientCard({ patientId: PATIENT.id });

    expect(screen.queryByText('Select Patient')).toBeNull();
    expect(screen.queryByPlaceholderText('Select patient...')).toBeNull();
  });

  test('fetches patient on mount and shows patient info', async () => {
    renderPatientCard({ patientId: PATIENT.id });

    await screen.findByText('Patient Info');
    await screen.findByText(PATIENT.name.full);
  });
});
