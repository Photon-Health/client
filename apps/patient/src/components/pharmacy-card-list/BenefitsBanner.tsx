import { HStack, Text } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { Tooltip } from '../Tooltip';

export const BenefitsBanner = () => {
  return (
    <HStack
      bg="blue.100"
      border="1px solid"
      borderColor="blue.200"
      borderRadius="xl"
      px={4}
      py={3}
      spacing={2}
      align="center"
      mx={{ base: -2, md: undefined }}
    >
      <Text fontSize="sm">
        <Text as="b">Using insurance?</Text> Your price might be different.
      </Text>
      <Tooltip
        placement="bottom-end"
        label={
          <Text fontSize="sm">
            These are cash coupon prices — what you’d pay without using insurance. Your insurance
            may cover this prescription, sometimes for less. Selecting a pharmacy below{' '}
            <b>doesn't commit you to either price</b>, you can determine whether to use insurance or
            cash coupon at the pharmacy.
          </Text>
        }
      >
        <FiInfo color="var(--chakra-colors-blue-500)" size={20} />
      </Tooltip>
    </HStack>
  );
};
