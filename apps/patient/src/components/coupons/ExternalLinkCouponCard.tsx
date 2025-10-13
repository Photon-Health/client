import { Box, Button, Text } from '@chakra-ui/react';
import { DiscountCard } from '../../__generated__/graphql';
import { CouponSourceLogo } from './CouponSourceLogo';
import { formatPrice } from '../../utils/formatters';
import { Card } from '../Card';

interface ExternalLinkCouponCardProps {
  coupon: ExternalLinkCoupon;
}

export type ExternalLinkCoupon = Pick<
  DiscountCard,
  'price' | 'externalUrl' | 'source' | 'retailPrice'
>;

export const ExternalLinkCouponCard = (props: ExternalLinkCouponCardProps) => {
  const { price, externalUrl, source, retailPrice } = props.coupon;
  return (
    <>
      <Box p={3} bgColor="blue.100" borderRadius="lg">
        <Text fontSize="sm" fontWeight="bold">
          Use this coupon to pay this discount price without insurance.
        </Text>
      </Box>
      <Card>
        <Text fontSize="4xl" alignSelf="center" fontWeight="700" py={0} lineHeight="1">
          ${formatPrice(price)}
        </Text>
        {retailPrice ? (
          <Text alignSelf="center" color="gray.500">
            Retail price:{' '}
            <span style={{ textDecoration: 'line-through' }}>${formatPrice(retailPrice)}</span>
          </Text>
        ) : null}
        <Button
          as="a"
          role="link"
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          w="full"
          variant="solid"
          bg="blue.600"
          _hover={{ bg: 'blue.700' }}
          color="white"
        >
          Get coupon
        </Button>
        {CouponSourceLogo(source)}
      </Card>
    </>
  );
};
