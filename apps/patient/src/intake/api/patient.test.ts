import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  networkApi: vi.fn(),
  REQUEST_METADATA: { source: 'WEB_APP', client: 'patient-intake' }
}));

import { networkApi } from './client';

const mockNetworkApi = vi.mocked(networkApi);

const lookupArgs = { phone: '+13035550142', lastName: 'Ortiz', dateOfBirth: '1990-04-12' };

const ambiguous = {
  patient: {
    __typename: 'AmbiguousPatientMatch',
    reason: 'pat_1 LOW PHONE',
    candidates: [
      { id: 'pat_1', firstName: 'Achilles', lastName: 'Ortiz' },
      { id: 'pat_2', firstName: 'Achilles', lastName: 'Ortiz' }
    ]
  }
};

const found = {
  patient: {
    __typename: 'PatientPayload',
    patient: {
      __typename: 'Patient',
      id: 'pat_1',
      demographic: { name: { first: 'Achilles', last: 'Ortiz' }, address: null },
      clinical: { medications: [{ id: 'med_1', name: 'Sertraline 50 mg', status: 'ACTIVE' }] }
    }
  }
};

/** The flag is read at module scope, so each case needs a fresh import. */
const loadLookup = async () => (await import('./patient')).lookupPatient;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('lookupPatient with the matcher workaround off', () => {
  it('reports an ambiguous match rather than guessing', async () => {
    mockNetworkApi.mockResolvedValue(ambiguous);
    const lookupPatient = await loadLookup();

    await expect(lookupPatient(lookupArgs)).resolves.toMatchObject({ kind: 'ambiguous' });
    expect(mockNetworkApi).toHaveBeenCalledTimes(1);
  });
});

describe('lookupPatient with the matcher workaround on', () => {
  beforeEach(() => vi.stubEnv('VITE_INTAKE_TRUST_TOP_MATCH', 'true'));

  it('re-reads the first candidate by id and treats it as matched', async () => {
    mockNetworkApi.mockResolvedValueOnce(ambiguous).mockResolvedValueOnce(found);
    const lookupPatient = await loadLookup();

    const result = await lookupPatient(lookupArgs);

    expect(result).toMatchObject({ kind: 'matched', patient: { id: 'pat_1' } });
    // The id read carries no demographic — that is what skips the mismatch checks.
    expect(mockNetworkApi.mock.calls[1][1].patient).toEqual({ id: 'pat_1' });
  });

  it('carries the medication history off the re-read, not the thin candidate', async () => {
    mockNetworkApi.mockResolvedValueOnce(ambiguous).mockResolvedValueOnce(found);
    const lookupPatient = await loadLookup();

    const result = await lookupPatient(lookupArgs);

    expect(result).toMatchObject({
      patient: { medications: [expect.objectContaining({ name: 'Sertraline 50 mg' })] }
    });
  });

  it('falls back to ambiguous when the re-read comes back empty', async () => {
    mockNetworkApi
      .mockResolvedValueOnce(ambiguous)
      .mockResolvedValueOnce({ patient: { __typename: 'PatientPayload', patient: null } });
    const lookupPatient = await loadLookup();

    await expect(lookupPatient(lookupArgs)).resolves.toMatchObject({ kind: 'ambiguous' });
  });

  it('leaves a clean match alone', async () => {
    mockNetworkApi.mockResolvedValue(found);
    const lookupPatient = await loadLookup();

    await expect(lookupPatient(lookupArgs)).resolves.toMatchObject({ kind: 'matched' });
    expect(mockNetworkApi).toHaveBeenCalledTimes(1);
  });
});
