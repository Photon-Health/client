import { Link, Text, HStack } from '@chakra-ui/react';
import { Logo } from './Logo';
import { useOrderContext } from '../views/Main';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

export const PoweredBy = () => {
  const patientAnalytics = usePatientAnalytics();
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
