import { Card, CardBody } from '@chakra-ui/react';

import capsuleLogo from '../assets/capsule_logo_small_circle.png';
import amazonPharmacyLogo from '../assets/amazon_pharmacy_logo_small_circle.png';
import altoLogo from '../assets/alto_logo.svg';
import costcoLogo from '../assets/costco_logo_small.png';
import costPlusLogo from '../assets/costplus_logo_small_circle.png';
import walmartLogo from '../assets/walmart_logo_small_circle.png';

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
  [process.env.REACT_APP_COST_PLUS_PHARMACY_ID as string]: {
    logo: costPlusLogo,
    name: 'Cost Plus Pharmacy',
    description: 'Delivery starting at $5'
  },
  [process.env.REACT_APP_WALMART_MAIL_ORDER_PHARMACY_ID as string]: {
    logo: walmartLogo,
    name: 'Walmart Pharmacy',
    description: 'Overnight shipping available'
  },
  ...Object.fromEntries(
    Object.keys(capsulePharmacyIdLookup).map((id) => [
      id,
      {
        logo: capsuleLogo,
        name: 'Capsule Pharmacy',
        description: 'Same or Next-Day Home Delivery'
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
        <PharmacyInfo
          pharmacy={pharmacy}
          tagline={brand.description}
          availableInYourArea={brand.name === 'Capsule Pharmacy'}
          freeDelivery={brand.name === 'Amazon Pharmacy'}
          boldPharmacyName={false}
        />
      </CardBody>
    </Card>
  );
};
