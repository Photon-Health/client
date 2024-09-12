import { VStack, Link, Text } from '@chakra-ui/react';
import { Logo } from './Logo';

export const PoweredBy = () => {
  return (
    <VStack spacing={1}>
      <Text fontSize="xs">Powered by</Text>
      <Link isExternal href="https://photon.health" fontSize="xs" textDecoration="underline">
        <Logo height={5} />
      </Link>
    </VStack>
  );
};
