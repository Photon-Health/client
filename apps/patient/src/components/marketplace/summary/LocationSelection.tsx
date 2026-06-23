import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';
import { text as t } from '../../../utils/text';

type LocationSelectionProps = {
  address: string;
  onClick: () => void;
  label?: string;
};

export function LocationSelection({
  address,
  onClick,
  label = t.showingLabel
}: LocationSelectionProps) {
  return (
    <Box
      as="button"
      type="button"
      w="full"
      bg="gray.50"
      borderRadius="xl"
      px={4}
      py={3}
      onClick={onClick}
      textAlign="left"
    >
      <HStack spacing={3} align="center">
        <FiMapPin size={20} color="var(--chakra-colors-gray-600)" />
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <Text
            fontSize="xs"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="medium"
          >
            {label}
          </Text>
          <Text fontWeight="semibold" fontSize="md" className="mp-mask" noOfLines={1}>
            {address}
          </Text>
        </VStack>
        <Text color="blue.500" fontWeight="semibold" fontSize="sm" flexShrink={0}>
          Change
        </Text>
      </HStack>
    </Box>
  );
}
