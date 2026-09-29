import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  networkApi: vi.fn(),
  REQUEST_METADATA: { source: 'WEB_APP', client: 'patient-intake' }
}));

import { networkApi } from './client';
import { draftPrescription } from './prescription';

const mockNetworkApi = vi.mocked(networkApi);

const treatment = {
  name: 'ulipristal acetate',
  displayName: 'ella (ulipristal acetate) 30 mg',
  instructions: 'Take 1 tablet by mouth as soon as possible',
  quantity: 1,
  unit: 'tablet',
  refillsAllowed: 0
};

const payload = (body: Record<string, unknown>) => ({
  prescription: { __typename: 'PrescriptionPayload', ...body }
});

const ambiguous = (options: Record<string, unknown>[]) =>
  payload({
    prescription: null,
    unappliedChanges: [{ key: 'treatment', status: 'AMBIGUOUS', reason: 'matches 2', options }]
  });

const treatmentSentIn = (call: number) =>
  (mockNetworkApi.mock.calls[call][1].prescription as { treatment: unknown }).treatment;

beforeEach(() => vi.clearAllMocks());

describe('draftPrescription', () => {
  it('references the treatment by ndc when the flow pins one', async () => {
    mockNetworkApi.mockResolvedValue(payload({ prescription: { id: 'rx_1' } }));

    await draftPrescription({
      patientId: 'pat_1',
      treatment: { ...treatment, ndc: '52544047254' }
    });

    expect(treatmentSentIn(0)).toEqual({ ndc: '52544047254' });
  });

  it('falls back to the free-text name', async () => {
    mockNetworkApi.mockResolvedValue(payload({ prescription: { id: 'rx_1' } }));

    await draftPrescription({ patientId: 'pat_1', treatment });

    expect(treatmentSentIn(0)).toEqual({ name: 'ulipristal acetate' });
  });

  it('retries with the only candidate when the treatment is ambiguous', async () => {
    mockNetworkApi
      .mockResolvedValueOnce(
        ambiguous([{ displayName: 'Ulipristal', argument: 'treatment.id', value: 'med_1' }])
      )
      .mockResolvedValueOnce(payload({ prescription: { id: 'rx_1' } }));

    await expect(draftPrescription({ patientId: 'pat_1', treatment })).resolves.toBe('rx_1');
    expect(treatmentSentIn(1)).toEqual({ id: 'med_1' });
  });

  it('retries with the single HIGH-confidence candidate', async () => {
    mockNetworkApi
      .mockResolvedValueOnce(
        ambiguous([
          {
            displayName: 'Ulipristal',
            argument: 'treatment.id',
            value: 'med_1',
            match: { confidence: 'HIGH' }
          },
          {
            displayName: 'Ulipristal ER',
            argument: 'treatment.id',
            value: 'med_2',
            match: { confidence: 'MEDIUM' }
          }
        ])
      )
      .mockResolvedValueOnce(payload({ prescription: { id: 'rx_1' } }));

    await expect(draftPrescription({ patientId: 'pat_1', treatment })).resolves.toBe('rx_1');
    expect(treatmentSentIn(1)).toEqual({ id: 'med_1' });
  });

  it('does not guess between equally confident candidates', async () => {
    mockNetworkApi.mockResolvedValue(
      ambiguous([
        {
          displayName: 'Ulipristal',
          argument: 'treatment.id',
          value: 'med_1',
          match: { confidence: 'HIGH' }
        },
        {
          displayName: 'ella',
          argument: 'treatment.id',
          value: 'med_2',
          match: { confidence: 'HIGH' }
        }
      ])
    );

    await expect(draftPrescription({ patientId: 'pat_1', treatment })).rejects.toThrow(/matches 2/);
    expect(mockNetworkApi).toHaveBeenCalledTimes(1);
  });

  it('surfaces a rejected treatment', async () => {
    mockNetworkApi.mockResolvedValue(
      payload({
        prescription: null,
        unappliedChanges: [
          { key: 'treatment', status: 'REJECTED', reason: 'No treatment in the catalog matches' }
        ]
      })
    );

    await expect(draftPrescription({ patientId: 'pat_1', treatment })).rejects.toThrow(
      /No treatment in the catalog/
    );
  });
});
