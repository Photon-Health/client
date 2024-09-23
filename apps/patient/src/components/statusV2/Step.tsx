import { Box, Icon, IconProps, VStack } from '@chakra-ui/react';
import { ElementType } from 'react';

export interface StepProps {
  icon: ElementType;
  color: 'primary' | 'danger' | 'warning';
  complete: boolean;
  iconProps?: IconProps;
}

export const Step = ({ color, icon, complete, iconProps }: StepProps) => {
  return (
    <VStack w="full">
      <Box
        bgColor={
          complete
            ? color === 'primary'
              ? 'blue.500'
              : color === 'danger'
              ? 'red.500'
              : 'orange.400'
            : 'gray.300'
        }
        w="full"
        h={1.5}
        borderRadius="lg"
      ></Box>
      <Icon
        boxSize={6}
        as={icon}
        color={
          complete
            ? color === 'primary'
              ? 'blue.500'
              : color === 'danger'
              ? 'red.500'
              : 'orange.400'
            : 'gray.300'
        }
        {...iconProps}
      />
    </VStack>
  );
};
