import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { OfferBundleDetails } from '../../utils/models';
import { PharmacyCardSentHereFrame } from '../PharmacyCardSentHereFrame';
import { getPharmacyCardBorderStyle } from '../pharmacyCardSentHereStyles';

interface Props {
  offer: OfferBundleDetails;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: OfferBundleDetails) => void;
}
export const OfferCard = ({
  offer,
  selected,
  handleSelect,
  isPharmacyFulfillingCurrentOrder,
  isPreferred
}: Props) => {
  const borderStyle = getPharmacyCardBorderStyle({
    isSentHere: isPharmacyFulfillingCurrentOrder,
    selected
  });

  const card = (
    <Card
      {...borderStyle}
      borderRadius="lg"
      shadow={'none'}
      onClick={() => handleSelect(offer.pharmacy.id, offer)}
      cursor={!isPharmacyFulfillingCurrentOrder ? 'pointer' : undefined}
      pointerEvents={isPharmacyFulfillingCurrentOrder ? 'none' : undefined}
      opacity={isPharmacyFulfillingCurrentOrder ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <OfferInfo pharmacy={offer.pharmacy} offer={offer} isPreferred={isPreferred} />
      </CardBody>
    </Card>
  );

  return isPharmacyFulfillingCurrentOrder ? (
    <PharmacyCardSentHereFrame>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
};
