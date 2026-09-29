import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  ageFromDateOfBirth,
  approveDraftRequest,
  getHandledIds,
  parseIntakeNotes,
  requestsConfig,
  toDraftRequest,
  urgencyColorScheme
} from './requests';
import { DRAFT_ID, makeDraftOrder, networkApiHandlers, networkGql } from './testFixtures';

const calls: { operation: string; variables: Record<string, any> }[] = [];
const server = setupServer(...networkApiHandlers(calls));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  vi.stubEnv('VITE_ENV_NAME', 'boson');
  vi.stubEnv('PHOTON_PP_AUTH_TOKEN', 'pp-token');
  calls.length = 0;
  localStorage.clear();
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

describe('parseIntakeNotes', () => {
  test('pulls out reason and urgency', () => {
    expect(parseIntakeNotes('Reason: UTI\nClinical urgency: Symptoms 2 days')).toMatchObject({
      reason: 'UTI',
      urgency: 'Symptoms 2 days'
    });
  });

  test('keeps other lines as answers, splitting on the first colon', () => {
    expect(parseIntakeNotes('Started at: 10:30\nno label here').answers).toEqual([
      { label: 'Started at', value: '10:30' },
      { label: '', value: 'no label here' }
    ]);
  });

  test('handles missing notes', () => {
    expect(parseIntakeNotes(null)).toEqual({ answers: [] });
  });
});

test.each([
  ['52 h left in window', 'red'],
  ['Symptoms 2 days', 'orange'],
  ['Labs attached', 'blue'],
  [undefined, 'gray']
])('urgencyColorScheme(%s) is %s', (urgency, color) => {
  expect(urgencyColorScheme(urgency)).toBe(color);
});

test('ageFromDateOfBirth accounts for birthdays not yet reached', () => {
  expect(ageFromDateOfBirth('1997-04-12', new Date('2026-04-11T12:00:00Z'))).toBe(28);
  expect(ageFromDateOfBirth('1997-04-12', new Date('2026-04-12T12:00:00Z'))).toBe(29);
});

test('toDraftRequest builds the list view from the draft order', () => {
  expect(toDraftRequest(makeDraftOrder())).toMatchObject({
    patientName: 'Achilles R.',
    state: 'CO',
    medication: 'Ella',
    reason: 'Emergency contraception',
    urgency: '52 h left in window'
  });
});

describe('requestsConfig', () => {
  test('is enabled on boson with a PP token', () => {
    expect(requestsConfig().enabled).toBe(true);
  });

  test('is disabled outside boson/tau', () => {
    vi.stubEnv('VITE_ENV_NAME', 'photon');
    expect(requestsConfig().enabled).toBe(false);
  });
});

describe('approveDraftRequest', () => {
  const request = () => toDraftRequest(makeDraftOrder());

  test('creates patient, drafts + signs prescription, then creates and submits the order', async () => {
    await expect(approveDraftRequest(request(), 'provider-token', 'ok')).resolves.toBe('ordd_new');

    expect(calls.map((c) => c.operation)).toEqual([
      'NetworkPatient',
      'NetworkPrescription',
      'NetworkPrescription',
      'NetworkOrder',
      'NetworkOrder'
    ]);
    expect(calls[1].variables.prescription).toMatchObject({
      patient: { id: 'pat_mine' },
      treatment: { id: 'med_ella' }
    });
    expect(calls[2].variables.prescription).toEqual({
      id: 'rx_mine',
      signing: { signedHash: 'hash_mine', message: 'ok' }
    });
    expect(calls[3].variables.input).toMatchObject({
      patient: { id: 'pat_mine' },
      prescriptions: { add: [{ id: 'rx_mine' }] },
      pharmacy: { id: 'phr_cvs' }
    });
    expect(calls[4].variables.input).toEqual({ order: { id: 'ordd_new' }, state: 'SUBMITTED' });
    expect(getHandledIds()).toEqual([DRAFT_ID]);
  });

  test('stops on an ambiguous patient match without creating anything else', async () => {
    server.use(
      networkGql.mutation('NetworkPatient', () =>
        HttpResponse.json({
          data: {
            patient: { __typename: 'AmbiguousPatientMatch', reason: 'name + DOB', candidates: [] }
          }
        })
      )
    );

    await expect(approveDraftRequest(request(), 'provider-token', 'ok')).rejects.toThrow(
      /multiple possible matches/
    );
    expect(calls).toHaveLength(0);
    expect(getHandledIds()).toEqual([]);
  });

  test('does not sign a prescription blocked by screening', async () => {
    server.use(
      networkGql.mutation('NetworkPrescription', ({ variables }) => {
        calls.push({ operation: 'NetworkPrescription', variables });
        return HttpResponse.json({
          data: {
            prescription: {
              __typename: 'PrescriptionPayload',
              prescription: {
                ...makeDraftOrder().prescriptions[0],
                status: 'BLOCKED',
                screeningAlerts: [
                  { severity: 'MAJOR', type: 'DRUG', description: 'Interacts with X' }
                ]
              },
              unappliedChanges: []
            }
          }
        });
      })
    );

    await expect(approveDraftRequest(request(), 'provider-token', 'ok')).rejects.toThrow(
      /blocked by screening: Interacts with X/
    );
    expect(calls.filter((c) => c.variables.prescription?.signing)).toHaveLength(0);
  });
});
