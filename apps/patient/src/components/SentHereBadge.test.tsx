import { render, screen } from '@testing-library/react';
import { SentHereBadge } from './SentHereBadge';

test('SentHereBadge renders sent here label', () => {
  render(<SentHereBadge />);

  expect(screen.getByTestId('pharmacy-sent-here-badge')).toHaveTextContent('Sent here');
});
