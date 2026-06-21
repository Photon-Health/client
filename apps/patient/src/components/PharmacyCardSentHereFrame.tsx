import { Box } from '@chakra-ui/react';
import { SentHereBadge } from './SentHereBadge';

export const PharmacyCardSentHereFrame = ({
  isSentHere,
  children
}: {
  isSentHere: boolean;
  children: React.ReactNode;
}) => {
  if (!isSentHere) {
    return <>{children}</>;
  }

  return (
    <Box position="relative" pt={2}>
      <SentHereBadge />
      {children}
    </Box>
  );
};
