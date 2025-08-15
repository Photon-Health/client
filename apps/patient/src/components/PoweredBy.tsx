import { Link, Text, HStack } from '@chakra-ui/react';
import { Logo } from './Logo';
import { patientAnalytics } from '../configs/analytics';

export const PoweredBy = () => {
  const handlePhotonClick = () => {
    patientAnalytics.track('Click Powered By Photon', {
      photonUrl: 'https://photon.health'
    });
  };

  return (
    <HStack spacing={1} mt={2}>
      <Text fontSize="xs">Powered by</Text>
      <Link
        isExternal
        href="https://photon.health"
        fontSize="xs"
        textDecoration="underline"
        onClick={handlePhotonClick}
      >
        <Logo height={4} width="100px" />
      </Link>
    </HStack>
  );
};
