import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import { orderStateMapping as t } from '../utils/text';
import { ExtendedFulfillmentType } from '../utils/models';

export const STATES = {
  PICK_UP: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'] as const,
  MAIL_ORDER: ['SENT', 'FILLING', 'SHIPPED', 'DELIVERED'] as const,
  COURIER: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'] as const
} as const;

interface Props {
  fulfillmentType: ExtendedFulfillmentType;
  status: string;
}

const getStates = (
  fulfillmentType: keyof typeof STATES
): (typeof STATES)[typeof fulfillmentType] => {
  return STATES[fulfillmentType];
};

export const HorizontalStatusStepper = ({ status, fulfillmentType }: Props) => {
  const currentStepIdx = getStates(fulfillmentType).findIndex((state) => state === status);

  return (
    <HStack w="full" justify="space-evenly">
      {getStates(fulfillmentType).map((state, i) => {
        const text = t[fulfillmentType][
          state as keyof (typeof t)[typeof fulfillmentType]
        ] as (typeof t)[typeof fulfillmentType]['SENT'];
        return (
          <VStack key={state} w="full">
            <Box
              bgColor={currentStepIdx >= i ? 'blue.500' : 'blue.100'}
              w="full"
              h={1.5}
              borderRadius="lg"
            ></Box>
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color={currentStepIdx >= i ? 'blue.500' : 'gray.500'}
            >
              {text.status}
            </Text>
          </VStack>
        );
      })}
    </HStack>
  );
};
