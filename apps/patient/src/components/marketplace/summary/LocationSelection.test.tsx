import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, expect, test, vi } from 'vitest';
import { LocationSelection } from './LocationSelection';

describe('LocationSelection', () => {
  test('renders the location label and address', () => {
    render(
      <ChakraProvider>
        <LocationSelection address="394 Henry St, Brooklyn, NY 11201" onClick={() => {}} />
      </ChakraProvider>
    );

    expect(screen.getByText('Showing pharmacies near')).toBeInTheDocument();
    expect(screen.getByText('394 Henry St, Brooklyn, NY 11201')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  test('calls onClick when the location card is clicked', async () => {
    const onClick = vi.fn();

    render(
      <ChakraProvider>
        <LocationSelection address="394 Henry St, Brooklyn, NY 11201" onClick={onClick} />
      </ChakraProvider>
    );

    await userEvent.click(screen.getByText('394 Henry St, Brooklyn, NY 11201'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
