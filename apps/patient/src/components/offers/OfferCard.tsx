import { Card, CardBody } from '@chakra-ui/react';

import { Offer, PHARMACY_BRANDING } from '../pharmacy-card-list';
import { OfferInfo } from './OfferInfo';

interface Props {
  offer: Offer;
  pharmacyId: string;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: Offer) => void;
}
export const OfferCard = ({
  offer,
  pharmacyId,
  selected,
  handleSelect,
  isPharmacyFulfillingCurrentOrder,
  isPreferred
}: Props) => {
  const brand = PHARMACY_BRANDING[pharmacyId];

  const pharmacy = {
    id: pharmacyId,
    name: offer.pharmacy.name,
    logo: brand?.logo ? brand.logo : ''
  };

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
      onClick={() => handleSelect(pharmacyId, offer)}
      mx={{ base: -2, md: undefined }}
      cursor={!isPharmacyFulfillingCurrentOrder ? 'pointer' : undefined}
      pointerEvents={isPharmacyFulfillingCurrentOrder ? 'none' : undefined}
      opacity={isPharmacyFulfillingCurrentOrder ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <OfferInfo
          pharmacy={pharmacy}
          offer={offer}
          isCurrentPharmacy={isPharmacyFulfillingCurrentOrder}
          isPreferred={isPreferred}
        />
      </CardBody>
    </Card>
  );
};
