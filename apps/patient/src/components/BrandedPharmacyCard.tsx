import { Card, CardBody } from '@chakra-ui/react';

import capsuleLogo from '../assets/capsule_logo_small.png';
import amazonPharmacyLogo from '../assets/amazon_pharmacy_logo_small.png';
import altoLogo from '../assets/alto_logo.svg';
import costcoLogo from '../assets/costco_logo_small.png';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';
import { PharmacyInfo } from './PharmacyInfo';

interface Props {
  pharmacyId: string;
  selected: boolean;
  handleSelect: (id: string) => void;
}

export const PHARMACY_BRANDING = {
  [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    name: 'Amazon Pharmacy',
    description: 'Delivers in 2-5 days'
  },
  [process.env.REACT_APP_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    name: 'Alto Pharmacy',
    description: 'Delivers as soon as today'
  },
  [process.env.REACT_APP_COSTCO_PHARMACY_ID as string]: {
    logo: costcoLogo,
    name: 'Costco Pharmacy',
    description: 'Delivers in 1-2 days'
  },
  ...Object.fromEntries(
    Object.keys(capsulePharmacyIdLookup).map((id) => [
      id,
      {
        logo: capsuleLogo,
        name: 'Capsule Pharmacy',
        description: 'Free Next Day Delivery'
      }
    ])
  )
};

export const BrandedPharmacyCard = ({ pharmacyId, selected, handleSelect }: Props) => {
  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  const pharmacy = { id: pharmacyId, name: brand.name, logo: brand.logo };

  return (
    <Card
      bgColor="white"
      border="2px solid"
      borderColor={selected ? 'brand.500' : 'white'}
      borderRadius="lg"
      onClick={() => handleSelect(pharmacyId)}
      mx={{ base: -3, md: undefined }}
      cursor="pointer"
    >
      <CardBody p={3}>
        <PharmacyInfo pharmacy={pharmacy} tagline={brand.description} boldPharmacyName={false} />
      </CardBody>
    </Card>
  );
};
