import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { SentHereBadge } from './SentHereBadge';
import theme from '../configs/theme';

test('SentHereBadge renders sent here label', () => {
  render(
    <ChakraProvider theme={theme()}>
      <SentHereBadge />
    </ChakraProvider>
  );

  expect(screen.getByTestId('pharmacy-sent-here-badge')).toHaveTextContent('Sent here');
});

test('SentHereBadge uses blue background when unselected', () => {
  render(
    <ChakraProvider theme={theme()}>
      <SentHereBadge selected={false} />
    </ChakraProvider>
  );

  expect(screen.getByTestId('pharmacy-sent-here-badge')).toHaveStyle({
    backgroundColor: 'var(--chakra-colors-blue-500)'
  });
});

test('SentHereBadge uses brand background with dark text when selected and brand color is light', () => {
  render(
    <ChakraProvider theme={theme({ accentColor: '#ffd100' })}>
      <SentHereBadge selected={true} />
    </ChakraProvider>
  );

  const badge = screen.getByTestId('pharmacy-sent-here-badge');
  expect(badge).toHaveStyle({ backgroundColor: 'var(--chakra-colors-brand-500)' });
  expect(screen.getByText('Sent here')).toHaveStyle({ color: 'var(--chakra-colors-gray-800)' });
});
