import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { OfferDetails } from '../../utils/models';

interface Props {
  offer: OfferDetails;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: OfferDetails) => void;
}
export const OfferCard = ({
  offer,
  selected,
  handleSelect,
  isPharmacyFulfillingCurrentOrder,
  isPreferred
}: Props) => {
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
      onClick={() => handleSelect(offer.pharmacy.id, offer)}
      mx={{ base: -2, md: undefined }}
      cursor={!isPharmacyFulfillingCurrentOrder ? 'pointer' : undefined}
      pointerEvents={isPharmacyFulfillingCurrentOrder ? 'none' : undefined}
      opacity={isPharmacyFulfillingCurrentOrder ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <OfferInfo
          pharmacy={offer.pharmacy}
          offer={offer}
          isCurrentPharmacy={isPharmacyFulfillingCurrentOrder}
          isPreferred={isPreferred}
        />
      </CardBody>
    </Card>
  );
};
