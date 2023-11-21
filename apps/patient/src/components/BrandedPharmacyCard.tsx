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

import { useOrderContext } from '../views/Main';

import capsuleLogo from '../assets/capsule_logo.png';
import amazonPharmacyLogo from '../assets/amazon_pharmacy.png';
import altoLogo from '../assets/alto_logo.svg';

import capsuleLookup from '../data/capsuleZipcodes.json';

interface Props {
  pharmacyId: string;
  selectedId: string;
  handleSelect: (id: string) => void;
}

const PHARMACY_BRANDING = {
  [process.env.REACT_APP_CAPSULE_PHARMACY_ID as string]: {
    logo: capsuleLogo,
    descriptionNextDay: 'FREE Delivery within 1-2 Days',
    descriptionSameDay: 'FREE Same Day Delivery'
  },
  [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    description: 'Save time. Save money. Stay healthy.'
  },
  [process.env.REACT_APP_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    description: 'Free same-day delivery'
  }
};

export const BrandedPharmacyCard = ({ pharmacyId, selectedId, handleSelect }: Props) => {
  const { order } = useOrderContext();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  let tagline = null;
  if (pharmacyId === process.env.REACT_APP_CAPSULE_PHARMACY_ID) {
    const capsuleDescription =
      pharmacyId === process.env.REACT_APP_CAPSULE_PHARMACY_ID &&
      capsuleLookup[order?.address?.postalCode] === 'Austin'
        ? brand.descriptionSameDay
        : brand.descriptionNextDay;

    const [firstWord, ...restOfSentence] = capsuleDescription.split(' ');

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
