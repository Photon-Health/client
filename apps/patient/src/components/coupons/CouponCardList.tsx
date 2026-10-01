import { Heading, VStack } from '@chakra-ui/react';
import { useOrderContext } from '../../views/Main';
import { getCurrentDiscountCard } from '../../utils/discountCards';
import { EmbeddedCouponCard } from './EmbeddedCouponCard';
import { ExternalLinkCouponCard } from './ExternalLinkCouponCard';

export const CouponCardList = () => {
  const { order } = useOrderContext();

  const discountCardToShow = getCurrentDiscountCard(order);

  if (!discountCardToShow) {
    return null;
  }

  return (
    <VStack w="full" alignItems="stretch" spacing={4}>
      <Heading as="h4" size="md">
        Coupon Card
      </Heading>
      {discountCardToShow.externalUrl ? (
        <ExternalLinkCouponCard coupon={discountCardToShow} order={order} />
      ) : (
        <EmbeddedCouponCard coupon={discountCardToShow} />
      )}
    </VStack>
  );
};
