import { Box, Center, Container, Stack } from '@chakra-ui/react'
import { Step } from './components/Step'
import t from '../../utils/text.json'

export const pickupStates = ['SENT', 'RECEIVED', 'READY', 'PICKED_UP']
export const courierStates = ['SENT', 'FILLING', 'DELIVERING', 'DELIVERED']

interface Props {
  status: string
  isCourier?: boolean
}

export const StatusStepper = ({ status, isCourier }: Props) => {
  const initialStepIdx = pickupStates.findIndex((state) => state === status)
  const currentStep = initialStepIdx + 1
  const states = isCourier ? courierStates : pickupStates

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => (
              <Step
                key={state}
                cursor="pointer"
                title={t.status[isCourier ? 'courierStates' : 'pickupStates'][state].title}
                description={
                  t.status[isCourier ? 'courierStates' : 'pickupStates'][state].description
                }
                isActive={currentStep === id}
                isCompleted={currentStep > id}
                isLastStep={states.length === id + 1}
              />
            ))}
          </Stack>
        </Center>
      </Container>
    </Box>
  )
}

StatusStepper.defaultProps = {
  isCourier: false
}
