import { VStack, Link, Text } from '@chakra-ui/react';
import { Logo } from './Logo';

export const PoweredBy = () => {
  return (
    <VStack spacing={1}>
      <Text fontSize="sm">Powered by</Text>
      <Link isExternal href="https://photon.health" fontSize="sm" textDecoration="underline">
        <Logo />
      </Link>
    </VStack>
  );
};
