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
import { orderStateMapping as t } from '../utils/text';
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
  const activeStep = currentStepIdx + 1; // step to do next

  const { order } = useOrderContext();

  const flattenedFills = countFillsAndRemoveDuplicates(order!.fills);
  const isMultiRx = flattenedFills.length > 1;
  const isDelivery = fulfillmentType === 'COURIER' || fulfillmentType === 'MAIL_ORDER';

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stepper
            index={activeStep}
            orientation="vertical"
            height="400px"
            gap="0"
            size="lg"
            colorScheme="green"
          >
            {getStates(fulfillmentType).map((state, id) => {
              // Types are a bit screwy here
              const text = t[fulfillmentType][
                state as keyof (typeof t)[typeof fulfillmentType]
              ] as (typeof t)[typeof fulfillmentType]['SENT'];
              const title = text.status;
              const description = `${text.description(isMultiRx)}${
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

StatusStepper.defaultProps = {
  patientAddress: undefined
};
