import {
  Box,
  Center,
  Container,
  Step,
  Stepper,
  StepIcon,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepNumber,
  StepSeparator
} from '@chakra-ui/react';
import { useOrderStateMapping } from '../hooks/useText';
import { ExtendedFulfillmentType } from '../utils/models';
import { countFillsAndRemoveDuplicates } from '../utils/general';
import { useOrderContext } from '../views/Main';

export const STATES = {
  PICK_UP: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'] as const,
  MAIL_ORDER: ['SENT', 'FILLING', 'SHIPPED', 'DELIVERED'] as const,
  COURIER: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'] as const
} as const;

interface Props {
  fulfillmentType: ExtendedFulfillmentType;
  status: string;
  patientAddress?: string;
}

const getStates = (
  fulfillmentType: keyof typeof STATES
): (typeof STATES)[typeof fulfillmentType] => {
  return STATES[fulfillmentType];
};

export const StatusStepper = ({ status, fulfillmentType, patientAddress }: Props) => {
  const currentStepIdx = getStates(fulfillmentType).findIndex((state) => state === status);
  const activeStep = currentStepIdx + 1;

  const { order } = useOrderContext();
  const stateMapping = useOrderStateMapping();

  const flattenedFills = countFillsAndRemoveDuplicates(order.fills);
  const isMultiRx = flattenedFills.length > 1;
  const isDelivery = fulfillmentType === 'COURIER' || fulfillmentType === 'MAIL_ORDER';

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stepper
            index={activeStep}
            orientation="vertical"
            height="300px"
            gap="0"
            size="md"
            colorScheme="green"
          >
            {getStates(fulfillmentType).map((state, id) => {
              const stateText = stateMapping[fulfillmentType][state]!;
              const title = stateText.status;
              const description = `${stateText.description(isMultiRx)}${
                isDelivery && (state === 'SHIPPED' || state === 'READY') ? patientAddress : ''
              }`;

              return (
                <Step key={id}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box ml={1}>
                    <StepTitle>{title}</StepTitle>
                    <StepDescription data-dd-privacy={isDelivery ? 'mask' : undefined}>
                      {description}
                    </StepDescription>
                  </Box>
                  <StepSeparator />
                </Step>
              );
            })}
          </Stepper>
        </Center>
      </Container>
    </Box>
  );
};
