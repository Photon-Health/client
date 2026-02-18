import { HStack, Image, Text } from '@chakra-ui/react';
import goodrxLogo from '../../assets/goodrx_logo.png';

export const CouponSourceLogo = (source: string) => (
  <>
    {source === 'goodrx' ? (
      <HStack w="full" justify="center">
        <Text fontSize="sm">Powered by</Text>
        <Image src={goodrxLogo} alt="GoodRx" h="20px" />
      </HStack>
    ) : null}
  </>
);
