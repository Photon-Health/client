import { HStack, Icon, Text, useTheme } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { getBrandContrastTextColor } from '../../../configs/theme';

type SentHereBadgeProps = {
  top?: number;
  selected?: boolean;
};

export const SentHereBadge = ({ top = 0, selected = false }: SentHereBadgeProps) => {
  const theme = useTheme();
  const bgColor = selected ? 'brand.500' : 'blue.500';
  const textColor = selected ? getBrandContrastTextColor(theme.colors.brand[500]) : 'white';

  return (
    <HStack
      position="absolute"
      top={top}
      left={4}
      transform="translateY(-50%)"
      bgColor={bgColor}
      color={textColor}
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
