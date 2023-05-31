import { HStack, Link, Text } from '@chakra-ui/react';

export const PoweredBy = () => {
  return (
    <HStack spacing={1}>
      <Text fontSize="sm">Powered by</Text>
      <Link isExternal href="https://photon.health" fontSize="sm" textDecoration="underline">
        Photon
      </Link>
    </HStack>
  );
};
