import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MailOrderSelectList } from './MailOrderSelectList';
import { MailOrderPharmacyOption } from './MailOrderSelectCard';

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
    onSelect: vi.fn()
  };

  test('renders all mail order options', () => {
    render(<MailOrderSelectList {...defaultProps} />);

    expect(screen.getByRole('radio', { name: 'Costco Pharmacy' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Walgreens Mail' })).toBeInTheDocument();
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
