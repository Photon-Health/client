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
import { PharmacyCardSentHereFrame } from '../PharmacyCardSentHereFrame';
import { getPharmacyCardBorderStyle } from '../pharmacyCardSentHereStyles';

interface Props {
  pharmacyId: string;
  /** sole auto route with no reroutes — shows "sent here" treatment */
  isAutoroutedPharmacy: boolean;
  /** order.pharmacy when not autorouted — independent of selected */
  isPharmacyFulfillingCurrentOrder: boolean;
  /** patient clicked this card in the pharmacy list */
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
  isAutoroutedPharmacy,
  isPharmacyFulfillingCurrentOrder,
  brandedOptionOverrides
}: Props) => {
  const brand = PHARMACY_BRANDING[pharmacyId];
  if (!brand) return null;

  const pharmacy = { id: pharmacyId, name: brand.name, logo: brand.logo };
  const borderStyle = getPharmacyCardBorderStyle({
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder,
    selected
  });

  const card = (
    <Card
      {...borderStyle}
      borderRadius="lg"
      shadow={'none'}
      onClick={() => handleSelect(pharmacyId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(pharmacyId);
        }
      }}
      cursor="pointer"
      role="radio"
      aria-checked={selected}
      aria-label={brand.name}
      tabIndex={0}
    >
      <CardBody p={3}>
        <PharmacyInfo
          pharmacy={pharmacy}
          tagline={brand.description}
          availableInYourArea={brand.name === 'Capsule Pharmacy'}
          freeDelivery={brand.name === 'Amazon Pharmacy'}
          brandedOptionOverride={brandedOptionOverrides}
          isPharmacyFulfillingCurrentOrder={isPharmacyFulfillingCurrentOrder}
          boldPharmacyName={false}
        />
      </CardBody>
    </Card>
  );

  return isAutoroutedPharmacy ? (
    <PharmacyCardSentHereFrame>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
};
