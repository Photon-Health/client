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
  PICK_UP: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'],
  COURIER: ['SENT', 'PREPARING', 'IN_TRANSIT', 'DELIVERED'],
  MAIL_ORDER: ['SENT', 'PREPARING', 'SHIPPED', 'DELIVERED']
};

interface Props {
  fulfillmentType: ExtendedFulfillmentType;
  status: string;
  patientAddress?: string;
}

export const StatusStepper = ({ status, fulfillmentType, patientAddress }: Props) => {
  // We don't have courier states, so get index from pickup and fake it
  const key = fulfillmentType === 'COURIER' ? 'PICK_UP' : fulfillmentType;
  const initialStepIdx = STATES[key].findIndex((state) => state === status);
  const states = STATES[fulfillmentType]; // map index to faux states
  const activeStep = initialStepIdx + 1; // step to do next

  const { order } = useOrderContext();

  const flattenedFills = countFillsAndRemoveDuplicates(order.fills);
  const isMultiRx = flattenedFills.length > 1;

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
            {states.map((state, id) => {
              const title = t[fulfillmentType][state].status;
              const isDelivery = state === 'IN_TRANSIT' || state === 'SHIPPED';
              const description = isDelivery
                ? `${t[fulfillmentType][state].description(isMultiRx)}${patientAddress}.`
                : t[fulfillmentType][state].description(isMultiRx);

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
