import { Box, Container, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function TabPanel({
  ariaLabel,
  pb,
  children
}: {
  ariaLabel: string;
  pb: number;
  children: ReactNode;
}) {
  return (
    <Box bg="gray.50" w="full" px={4}>
      <Container px={-3} pb={pb} pt={4}>
        <VStack
          spacing={2}
          align="stretch"
          w="full"
          rowGap="6"
          role="radiogroup"
          aria-label={ariaLabel}
        >
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
