import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MailOrderSelectList } from './MailOrderSelectList';
import { MailOrderPharmacyOption } from './MailOrderSelectCard';

vi.mock('../../utils/tracking/OfferImpressionTracker', () => ({
  OfferImpressionTracker: ({
    children,
    enabled,
    ordinalPosition,
    pharmacy,
    isAlreadySelected
  }: {
    children: React.ReactNode;
    enabled: boolean;
    ordinalPosition: number;
    pharmacy: { id: string; name: string; fulfillmentTypes?: string[]; logo?: string };
    isAlreadySelected: boolean;
  }) => (
    <div
      data-testid="offer-impression-tracker"
      data-enabled={enabled}
      data-ordinal-position={ordinalPosition}
      data-pharmacy-id={pharmacy.id}
      data-pharmacy-name={pharmacy.name}
      data-pharmacy-fulfillment-types={pharmacy.fulfillmentTypes?.join(',') ?? ''}
      data-pharmacy-logo={pharmacy.logo ?? ''}
      data-is-already-selected={isAlreadySelected}
    >
      {children}
    </div>
  )
}));

describe('MailOrderSelectList', () => {
  const mockOptions: MailOrderPharmacyOption[] = [
    {
      id: 'phr_costco',
      name: 'Costco Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER'],
      logo: 'https://example.com/costco.png'
    },
    { id: 'phr_walgreens', name: 'Walgreens Mail' }
  ];

  const defaultProps = {
    options: mockOptions,
    onSelect: vi.fn(),
    shouldTrackOfferImpressionsAndSelections: true
  };

  test('renders all mail order options', () => {
    render(<MailOrderSelectList {...defaultProps} />);

    expect(screen.getByRole('radio', { name: 'Costco Pharmacy' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Walgreens Mail' })).toBeInTheDocument();
  });

  test('wraps each mail order option in OfferImpressionTracker', () => {
    render(<MailOrderSelectList {...defaultProps} />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers).toHaveLength(2);
  });

  test('passes enabled=false to OfferImpressionTracker when impression tracking is disabled', () => {
    render(
      <MailOrderSelectList {...defaultProps} shouldTrackOfferImpressionsAndSelections={false} />
    );

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    impressionTrackers.forEach((tracker) => {
      expect(tracker).toHaveAttribute('data-enabled', 'false');
    });
  });

  test('passes ordinal position offset by numberOfPrecedingOptions', () => {
    render(<MailOrderSelectList {...defaultProps} numberOfPrecedingOptions={3} />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers[0]).toHaveAttribute('data-ordinal-position', '3');
    expect(impressionTrackers[1]).toHaveAttribute('data-ordinal-position', '4');
  });

  test('passes isAlreadySelected true only for selected pharmacy', () => {
    render(<MailOrderSelectList {...defaultProps} selectedId="phr_costco" />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers[0]).toHaveAttribute('data-is-already-selected', 'true');
    expect(impressionTrackers[1]).toHaveAttribute('data-is-already-selected', 'false');
  });

  test('passes fulfillmentTypes and logo to OfferImpressionTracker pharmacy prop', () => {
    render(<MailOrderSelectList {...defaultProps} />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers[0]).toHaveAttribute('data-pharmacy-fulfillment-types', 'MAIL_ORDER');
    expect(impressionTrackers[0]).toHaveAttribute(
      'data-pharmacy-logo',
      'https://example.com/costco.png'
    );
    expect(impressionTrackers[1]).toHaveAttribute('data-pharmacy-fulfillment-types', '');
    expect(impressionTrackers[1]).toHaveAttribute('data-pharmacy-logo', '');
  });

  test('calls onSelect when mail order card is clicked', async () => {
    const onSelect = vi.fn();
    render(<MailOrderSelectList {...defaultProps} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Costco Pharmacy' }));

    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  test('renders sent here badge for autorouted pharmacy', () => {
    render(<MailOrderSelectList {...defaultProps} autoroutedPharmacyId="phr_costco" />);

    expect(screen.getByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
  });
});
