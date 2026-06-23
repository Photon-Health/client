import { HStack, Icon, Text } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';

type SentHereBadgeProps = {
  top?: number;
};

export const SentHereBadge = ({ top = 0 }: SentHereBadgeProps) => {
  return (
    <HStack
      position="absolute"
      top={top}
      left={4}
      transform="translateY(-50%)"
      zIndex={1}
      bgColor="blue.500"
      color="white"
      borderRadius="full"
      px={3}
      py={1}
      spacing={1.5}
      data-testid="pharmacy-sent-here-badge"
    >
      <Icon as={FiCheck} boxSize={3.5} aria-hidden />
      <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
        Sent here
      </Text>
    </HStack>
  );
};
