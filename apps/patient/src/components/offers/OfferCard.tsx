import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { OfferBundleDetails } from '../../utils/models';
import { PharmacyCardSentHereFrame } from '../PharmacyCardSentHereFrame';
import { getPharmacyCardBorderStyle } from '../pharmacyCardSentHereStyles';

interface Props {
  offer: OfferBundleDetails;
  isAutoroutedPharmacy: boolean;
  isCurrentPharmacy: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: OfferBundleDetails) => void;
}
export const OfferCard = ({
  offer,
  selected,
  handleSelect,
  isAutoroutedPharmacy,
  isCurrentPharmacy,
  isPreferred
}: Props) => {
  const borderStyle = getPharmacyCardBorderStyle({
    isAutoroutedPharmacy,
    isCurrentPharmacy,
    selected
  });

  const card = (
    <Card
      {...borderStyle}
      borderRadius="lg"
      shadow={'none'}
      onClick={() => handleSelect(offer.pharmacy.id, offer)}
      cursor="pointer"
    >
      <CardBody p={3}>
        <OfferInfo
          pharmacy={offer.pharmacy}
          offer={offer}
          isCurrentPharmacy={isCurrentPharmacy && selected}
          isPreferred={isPreferred}
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
