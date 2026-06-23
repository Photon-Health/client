import { HStack, Text } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { Tooltip } from '../Tooltip';

export const BenefitsBanner = ({ onTooltipClick }: { onTooltipClick: () => void }) => {
  return (
    <HStack spacing={2} align="center">
      <Tooltip
        placement="bottom-end"
        wrapperProps={{ onClick: onTooltipClick }}
        label={
          <Text fontSize="sm">
            These are cash coupon prices — what you’d pay without using insurance. Your insurance
            may cover this prescription, sometimes for less. Selecting a pharmacy below{' '}
            <b>doesn't commit you to either price</b>, you can determine whether to use insurance or
            cash coupon at the pharmacy.
          </Text>
        }
      >
        <FiInfo color="var(--chakra-colors-gray.500)" size={18} />
      </Tooltip>
      <Text fontSize="sm" color="gray.700">
        <Text as="span" fontWeight="semibold">
          Using insurance?
        </Text>{' '}
        Your price might be different.
      </Text>
    </HStack>
  );
};
