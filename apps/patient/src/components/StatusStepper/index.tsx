import { Box, Center, Container, Stack } from '@chakra-ui/react';
import { Step } from './components/Step';
import t from '../../utils/text.json';
import { ExtendedFulfillmentType } from '../../utils/models';

export const STATES = {
  PICK_UP: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'],
  COURIER: ['SENT', 'FILLING', 'IN_TRANSIT', 'DELIVERED'],
  MAIL_ORDER: ['SENT', 'FILLING', 'SHIPPED', 'DELIVERED']
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

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => {
              const title = t.status[fulfillmentType].states[state].title;
              const description =
                state === 'IN_TRANSIT' || state === 'SHIPPED'
                  ? `${t.status[fulfillmentType].states[state].description}${patientAddress}.` // show delivery address on courier
                  : t.status[fulfillmentType].states[state].description;

              return (
                <Step
                  key={state}
                  cursor="pointer"
                  title={title}
                  description={description}
                  isActive={activeStep === id}
                  isCompleted={activeStep > id}
                  isLastStep={states.length === id + 1}
                />
              );
            })}
          </Stack>
        </Center>
      </Container>
    </Box>
  );
};

StatusStepper.defaultProps = {
  patientAddress: undefined
};
