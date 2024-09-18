import { Link, Text, HStack } from '@chakra-ui/react';
import { Logo } from './Logo';

export const PoweredBy = () => {
  return (
    <HStack spacing={1} mt={2}>
      <Text fontSize="xs">Powered by</Text>
      <Link isExternal href="https://photon.health" fontSize="xs" textDecoration="underline">
        <Logo height={4} />
      </Link>
    </HStack>
  );
};
