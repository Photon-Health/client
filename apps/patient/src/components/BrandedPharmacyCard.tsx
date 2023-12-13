import {
  Box,
  Card,
  CardBody,
  Image,
  SlideFade,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';

import capsuleLogo from '../assets/capsule_logo.png';
import amazonPharmacyLogo from '../assets/amazon_pharmacy.png';
import altoLogo from '../assets/alto_logo.svg';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';

interface Props {
  pharmacyId: string;
  selectedId: string;
  handleSelect: (id: string) => void;
}

const PHARMACY_BRANDING = {
  [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    description: 'Save time. Save money. Stay healthy.'
  },
  [process.env.REACT_APP_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    description: 'Free same-day delivery'
  }
};
// TODO: need to make this more elegant
const capsulePharmacyIds = Object.keys(capsulePharmacyIdLookup);
for (let i = 0; i < capsulePharmacyIds.length; i++) {
  PHARMACY_BRANDING[capsulePharmacyIds[i]] = {
    logo: capsuleLogo,
    description: 'FREE Same Day Delivery'
  };
}

export const BrandedPharmacyCard = ({ pharmacyId, selectedId, handleSelect }: Props) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  let tagline = null;
  if (capsulePharmacyIdLookup[pharmacyId]) {
    const [firstWord, ...restOfSentence] = brand.description.split(' ');

    tagline = (
      <Text fontSize="sm" display="inline">
        <Box as="span" color="gray.900" mr={1}>
          {firstWord}
        </Box>
        <Box as="span" color="gray.500">
          {restOfSentence.join(' ')}
        </Box>
      </Text>
    );
  } else {
    tagline = (
      <Text fontSize="sm" color="gray.500">
        {brand.description}
      </Text>
    );
  }

  return (
    <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${pharmacyId}`}>
      <Card
        bgColor="white"
        cursor="pointer"
        onClick={() => handleSelect(pharmacyId)}
        border="2px solid"
        borderColor={selectedId === pharmacyId ? 'brand.600' : 'white'}
        mx={isMobile ? -3 : undefined}
      >
        <CardBody p={3}>
          <VStack align="start" spacing={2}>
            <Image src={brand.logo} width="auto" height="30px" />
            {tagline}
          </VStack>
        </CardBody>
      </Card>
    </SlideFade>
  );
};
