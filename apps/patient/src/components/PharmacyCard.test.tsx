import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PharmacyCard } from './PharmacyCard';
import { generatePharmacy } from '../test-utils/generators';

vi.mock('./PharmacyInfo', () => ({
  PharmacyInfo: ({ pharmacy }: { pharmacy: { name: string } }) => (
    <div data-testid="pharmacy-info">{pharmacy.name}</div>
  )
}));

describe('PharmacyCard', () => {
  const pharmacy = generatePharmacy({ id: 'phr_current', name: 'Current Pharmacy' });

  test('PharmacyCard renders sent here badge when pharmacy is current', () => {
    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isCurrentPharmacy={true}
        selectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
  });

  test('PharmacyCard does not render sent here badge for other pharmacies', () => {
    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isCurrentPharmacy={false}
        selectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.queryByTestId('pharmacy-sent-here-badge')).not.toBeInTheDocument();
  });
});
