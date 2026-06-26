import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { BrandedPharmacyCard } from './BrandedPharmacyCard';

vi.mock('../PharmacyInfo', () => ({
  PharmacyInfo: ({ pharmacy }: { pharmacy: { name: string } }) => (
    <div data-testid="pharmacy-info">{pharmacy.name}</div>
  )
}));

describe('BrandedPharmacyCard', () => {
  const amazonPharmacyId = 'phr_demoAmazon';

  test('BrandedPharmacyCard does not call handleSelect when current pharmacy is not autorouted', () => {
    const handleSelect = vi.fn();

    render(
      <BrandedPharmacyCard
        pharmacyId={amazonPharmacyId}
        isAutoroutedPharmacy={false}
        isPharmacyFulfillingCurrentOrder={true}
        selected={false}
        handleSelect={handleSelect}
      />
    );

    expect(screen.getByRole('radio', { name: 'Amazon Pharmacy' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(handleSelect).not.toHaveBeenCalled();
  });

  test('BrandedPharmacyCard calls handleSelect when pharmacy is autorouted', async () => {
    const handleSelect = vi.fn();

    render(
      <BrandedPharmacyCard
        pharmacyId={amazonPharmacyId}
        isAutoroutedPharmacy={true}
        isPharmacyFulfillingCurrentOrder={false}
        selected={false}
        handleSelect={handleSelect}
      />
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Amazon Pharmacy' }));

    expect(handleSelect).toHaveBeenCalledWith(amazonPharmacyId);
  });
});
