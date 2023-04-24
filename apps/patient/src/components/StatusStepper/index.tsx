import { Box, Center, Container, Stack } from '@chakra-ui/react'
import { Step } from './components/Step'
import t from '../../utils/text.json'
import { formatAddress } from '../../utils/general'

export const pickupStates = ['SENT', 'RECEIVED', 'READY', 'PICKED_UP']
export const courierStates = ['SENT', 'FILLING', 'DELIVERING', 'DELIVERED']

interface Props {
  status: string
  isCourier?: boolean
  patientAddress?: string
}

export const StatusStepper = ({ status, isCourier, patientAddress }: Props) => {
  const initialStepIdx = pickupStates.findIndex((state) => state === status)
  const currentStep = initialStepIdx + 1
  const states = isCourier ? courierStates : pickupStates
  const fulfillmentType = isCourier ? 'courier' : 'pickup'

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => {
              const title = t.status[fulfillmentType].states[state].title
              const description =
                state === 'DELIVERING'
                  ? `${t.status[fulfillmentType].states[state].description}${patientAddress}.` // show delivery address on courier
                  : t.status[fulfillmentType].states[state].description

              return (
                <Step
                  key={state}
                  cursor="pointer"
                  title={title}
                  description={description}
                  isActive={currentStep === id}
                  isCompleted={currentStep > id}
                  isLastStep={states.length === id + 1}
                />
              )
            })}
          </Stack>
        </Center>
      </Container>
    </Box>
  )
}

StatusStepper.defaultProps = {
  isCourier: false,
  patientAddress: undefined
}
