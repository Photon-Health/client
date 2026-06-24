import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PharmacyCard } from './PharmacyCard';
import { generatePharmacy } from '../test-utils/generators';

vi.mock('./PharmacyInfo', () => ({
  PharmacyInfo: ({
    pharmacy,
    isCurrentPharmacy
  }: {
    pharmacy: { name: string };
    isCurrentPharmacy?: boolean;
  }) => (
    <div data-testid="pharmacy-info">
      {pharmacy.name}
      {isCurrentPharmacy ? (
        <span data-testid="pharmacy-info-current-pharmacy">Current Pharmacy</span>
      ) : null}
    </div>
  )
}));

describe('PharmacyCard', () => {
  const pharmacy = generatePharmacy({ id: 'phr_current', name: 'Current Pharmacy' });

  test('PharmacyCard renders sent here badge when pharmacy is autorouted', () => {
    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isAutoroutedPharmacy={true}
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
        isAutoroutedPharmacy={false}
        selectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.queryByTestId('pharmacy-sent-here-badge')).not.toBeInTheDocument();
  });

  test('PharmacyCard shows current pharmacy tag when pharmacy is current', () => {
    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isCurrentPharmacy={true}
        selectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('pharmacy-info-current-pharmacy')).toBeInTheDocument();
  });

  test('PharmacyCard does not show current pharmacy tag when pharmacy is not current', () => {
    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isCurrentPharmacy={false}
        selected={true}
        selectable={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.queryByTestId('pharmacy-info-current-pharmacy')).not.toBeInTheDocument();
  });

  test('PharmacyCard calls onSelect when autorouted pharmacy is clicked', async () => {
    const onSelect = vi.fn();

    render(
      <PharmacyCard
        pharmacy={pharmacy}
        isAutoroutedPharmacy={true}
        selectable={true}
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole('radio', { name: pharmacy.name }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
