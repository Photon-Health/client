import { Box } from '@chakra-ui/react';
import { SentHereBadge } from './SentHereBadge';

export const PharmacyCardSentHereFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box position="relative" pt={2}>
      <SentHereBadge />
      {children}
    </Box>
  );
};
