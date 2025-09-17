import { ReactNode } from 'react';
import { Container, Heading, Stack, Text, useBreakpointValue, VStack } from '@chakra-ui/react';

export interface PageProps {
  kicker?: string;
  header?: string | ReactNode;
  children?: ReactNode;
  buttons?: ReactNode;
  disableScroll?: boolean;
}

export const Page = ({
  kicker = '',
  header = '',
  children = undefined,
  buttons = undefined,
  disableScroll = false
}: PageProps) => {
  return (
    <Container py="8" flex="1" height={disableScroll ? window.innerHeight - 64 : '100%'}>
      <Stack spacing={{ base: kicker ? '3' : '8', lg: kicker ? '3' : '6' }}>
        <Stack
          spacing="4"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'start', lg: 'center' }}
        >
          <VStack spacing={0} align="start">
            <Text fontSize="sm" fontWeight="semibold" color="gray.500" ps={0} ms={0}>
              {kicker}
            </Text>
            <Heading size={useBreakpointValue({ base: 'xs' })}>{header}</Heading>
          </VStack>
          {buttons}
        </Stack>
        {children}
      </Stack>
    </Container>
  );
};
