import { Card, CardBody } from '@chakra-ui/react';

import capsuleLogo from '../../assets/capsule_logo_small_circle.png';
import amazonPharmacyLogo from '../../assets/amazon_pharmacy_logo_small_circle.png';
import altoLogo from '../../assets/alto_logo.svg';
import costcoLogo from '../../assets/costco_logo_small.png';
import costPlusLogo from '../../assets/costplus_logo_small_circle.png';
import walmartLogo from '../../assets/walmart_logo_small_circle.png';
import novocareLogo from '../../assets/novo_circle.png';

import capsulePharmacyIdLookup from '../../data/capsulePharmacyIds.json';
import { PharmacyInfo } from '../PharmacyInfo';
import { BrandedOptionOverrides } from './BrandedOptions';

interface Props {
  pharmacyId: string;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  handleSelect: (id: string) => void;
  brandedOptionOverrides?: BrandedOptionOverrides;
}

export const PHARMACY_BRANDING = {
  ['phr_demoAmazon']: {
    logo: amazonPharmacyLogo,
    name: 'Amazon Pharmacy',
    description: 'Delivers in 2-5 days'
  },
  [import.meta.env.VITE_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    name: 'Amazon Pharmacy',
    description: 'Delivers in 2-5 days'
  },
  [import.meta.env.VITE_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    name: 'Alto Pharmacy',
    description: 'Delivers as soon as today'
  },
  [import.meta.env.VITE_COSTCO_PHARMACY_ID as string]: {
    logo: costcoLogo,
    name: 'Costco Pharmacy',
    description: 'Delivers in 1-2 days'
  },
  [import.meta.env.VITE_COST_PLUS_PHARMACY_ID as string]: {
    logo: costPlusLogo,
    name: 'Cost Plus Pharmacy',
    description: 'Delivery starting at $5'
  },
  [import.meta.env.VITE_WALMART_MAIL_ORDER_PHARMACY_ID as string]: {
    logo: walmartLogo,
    name: 'Walmart Pharmacy',
    description: 'Overnight shipping available'
  },
  [import.meta.env.VITE_NOVOCARE_PHARMACY_ID as string]: {
    logo: novocareLogo,
    name: 'NovoCare',
    description: 'Delivers in 3-5 days'
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

export const BrandedPharmacyCard = ({
  pharmacyId,
  selected,
  handleSelect,
  isPharmacyFulfillingCurrentOrder,
  brandedOptionOverrides
}: Props) => {
  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  const pharmacy = { id: pharmacyId, name: brand.name, logo: brand.logo };

  return (
    <Card
      // if the pharmacy is fulfilling the current order
      // we should not be able to select it again
      bgColor={isPharmacyFulfillingCurrentOrder ? 'gray.200' : 'white'}
      border="2px solid"
      borderWidth={selected ? '2px' : '1px'}
      borderColor={
        selected ? 'brand.500' : isPharmacyFulfillingCurrentOrder ? 'gray.300' : 'gray.200'
      }
      borderRadius="lg"
      shadow={'none'}
      onClick={() => handleSelect(pharmacyId)}
      mx={{ base: -2, md: undefined }}
      cursor={!isPharmacyFulfillingCurrentOrder ? 'pointer' : undefined}
      pointerEvents={isPharmacyFulfillingCurrentOrder ? 'none' : undefined}
      opacity={isPharmacyFulfillingCurrentOrder ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <PharmacyInfo
          pharmacy={pharmacy}
          tagline={brand.description}
          availableInYourArea={brand.name === 'Capsule Pharmacy'}
          isCurrentPharmacy={isPharmacyFulfillingCurrentOrder}
          freeDelivery={brand.name === 'Amazon Pharmacy'}
          brandedOptionOverride={brandedOptionOverrides}
          boldPharmacyName={false}
        />
      </CardBody>
    </Card>
  );
};
