import { Link, Text, HStack } from '@chakra-ui/react';
import { Logo } from './Logo';
import { patientAnalytics } from '../configs/analytics';
import { useOrderContext } from '../views/Main';

export const PoweredBy = () => {
  const { order } = useOrderContext();

  const handlePhotonClick = () => {
    patientAnalytics.track('Click Powered By Photon', order, {
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
