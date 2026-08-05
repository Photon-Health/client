import { groupAlertsByPrescription } from './ScreeningAlertsByPrescription';
import { PrescriptionScreeningAlert } from '@photonhealth/sdk/dist/clinical-api/types';

const drafted = (id: string, name: string) => ({
  __typename: 'PrescriptionScreeningAlertInvolvedDraftedPrescription',
  id,
  name
});

const alert = (id: string, involvedEntities: unknown[]): PrescriptionScreeningAlert =>
  ({
    id,
    involvedEntities
  } as unknown as PrescriptionScreeningAlert);

describe('groupAlertsByPrescription', () => {
  it('groups alerts for the same medication name under one entry', () => {
    const alert1 = alert('alert-1', [drafted('rx-1', 'Lisinopril')]);
    const alert2 = alert('alert-2', [drafted('rx-2', 'Lisinopril')]);

    const groups = groupAlertsByPrescription([alert1, alert2]);

    expect(groups).toHaveLength(1);
    expect(groups[0].alerts).toEqual([alert1, alert2]);
  });

  it('keeps alerts for different medication names in separate groups', () => {
    const alert1 = alert('alert-1', [drafted('rx-1', 'Lisinopril')]);
    const alert2 = alert('alert-2', [drafted('rx-2', 'Metformin')]);

    const groups = groupAlertsByPrescription([alert1, alert2]);

    expect(groups).toHaveLength(2);
  });
});
