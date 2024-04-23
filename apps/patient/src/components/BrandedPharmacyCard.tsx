import { Image, Text, VStack, Box, Container } from '@chakra-ui/react';

import capsuleLogo from '../assets/capsule_logo.png';
import amazonPharmacyLogo from '../assets/amazon_pharmacy.png';
import altoLogo from '../assets/alto_logo.svg';
import costcoLogo from '../assets/costco_pharmacy_logo.png';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';

interface Props {
  pharmacyId: string;
  selectedId?: string | undefined;
  handleSelect?: ((id: string) => void) | undefined;
}

const PHARMACY_BRANDING = {
  [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    description: 'Delivers in 2-5 days'
  },
  [process.env.REACT_APP_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    description: 'Delivers as soon as today'
  },
  [process.env.REACT_APP_COSTCO_PHARMACY_ID as string]: {
    logo: costcoLogo,
    description: 'Delivers in 1-2 days'
  }
};
// TODO: need to make this more elegant
const capsulePharmacyIds = Object.keys(capsulePharmacyIdLookup);
for (let i = 0; i < capsulePharmacyIds.length; i++) {
  PHARMACY_BRANDING[capsulePharmacyIds[i]] = {
    logo: capsuleLogo,
    description: 'Delivers as soon as today'
  };
}

export const BrandedPharmacyCard = ({ pharmacyId, selectedId, handleSelect }: Props) => {
  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  const tagline = brand.description ? (
    <Text fontSize="sm" color="gray.500">
      {brand.description}
    </Text>
  ) : null;

  return (
    <Container>
      <Box
        py={2}
        bgColor="white"
        cursor="pointer"
        onClick={() => handleSelect?.(pharmacyId)}
        border="2px solid"
        borderColor={selectedId === pharmacyId ? 'brand.500' : 'white'}
      >
        <VStack align="start" spacing={1}>
          <Image src={brand.logo} width="auto" height="30px" />
          {tagline}
        </VStack>
      </Box>
    </Container>
  );
};
