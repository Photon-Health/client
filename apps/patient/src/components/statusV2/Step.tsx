import { Box, Icon, IconProps, VStack } from '@chakra-ui/react';
import { ElementType } from 'react';

export interface StepProps {
  icon: ElementType;
  color: 'primary' | 'danger' | 'warning';
  complete: boolean;
  iconProps?: IconProps;
}

export const Step = ({ color, icon, complete, iconProps }: StepProps) => {
  const uiColor = complete
    ? color === 'primary'
      ? 'blue.500'
      : color === 'danger'
      ? 'red.500'
      : 'orange.400'
    : 'blue.100';

  return (
    <VStack w="full">
      <Box bgColor={uiColor} w="full" h={2} borderRadius="lg"></Box>
      <Icon boxSize={6} as={icon} color={uiColor} {...iconProps} />
    </VStack>
  );
};
