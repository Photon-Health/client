import { render, screen } from '@testing-library/react';
import { PharmacyCardSentHereFrame } from './PharmacyCardSentHereFrame';

test('PharmacyCardSentHereFrame renders sent here badge with children', () => {
  render(
    <PharmacyCardSentHereFrame>
      <div data-testid="card-content">Card</div>
    </PharmacyCardSentHereFrame>
  );

  expect(screen.getByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
  expect(screen.getByTestId('card-content')).toBeInTheDocument();
});
