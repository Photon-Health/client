import { Box } from '@chakra-ui/react';
import { SentHereBadge } from './SentHereBadge';

// Matches pt below so the badge center sits on the card's top border.
const sentHereCardTopOffset = 2;

export const PharmacyCardSentHereFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box position="relative" pt={sentHereCardTopOffset}>
      <SentHereBadge top={sentHereCardTopOffset} />
      {children}
    </Box>
  );
};
