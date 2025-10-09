import { Heading, VStack } from '@chakra-ui/react';
import { useOrderContext } from '../../views/Main';
import { EmbeddedCouponCard } from './EmbeddedCouponCard';
import { ExternalLinkCouponCard } from './ExternalLinkCouponCard';

export const CouponCardList = () => {
  const { order } = useOrderContext();

  if (!order.discountCards || order.discountCards.length === 0) {
    return null;
  }

  const discountCards = order.discountCards.filter(
    // Filter out discount cards that don't apply to the current pharmacy
    // If the order was rerouted, we might have discount cards from the previous pharmacy
    (card) => card.pharmacyId === order.pharmacy?.id
  );

  if (discountCards.length === 0) {
    return null;
  }

  const discountCardToShow = discountCards[0];

  const { price, bin, pcn, group, memberId } = discountCardToShow;

  if (!price || !bin || !pcn || !group || !memberId) {
    return null;
  }

  return (
    <VStack w="full" alignItems="stretch" spacing={4}>
      <Heading as="h4" size="md">
        Coupon Card
      </Heading>
      {discountCardToShow.externalUrl ? (
        <ExternalLinkCouponCard coupon={discountCardToShow} />
      ) : (
        <EmbeddedCouponCard coupon={discountCardToShow} />
      )}
    </VStack>
  );
};
