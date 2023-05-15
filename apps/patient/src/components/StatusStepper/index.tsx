import { Box, Center, Container, Stack } from '@chakra-ui/react'
import { Step } from './components/Step'
import t from '../../utils/text.json'
import { FulfillmentType } from '../../utils/models'

export const STATES = {
  pickup: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'],
  courier: ['SENT', 'FILLING', 'IN_TRANSIT', 'DELIVERED'],
  mailOrder: ['SENT', 'PROCESSING', 'SHIPPED', 'DELIVERED']
}

interface Props {
  fulfillmentType: FulfillmentType
  status: string
  patientAddress?: string
}

export const StatusStepper = ({ status, fulfillmentType, patientAddress }: Props) => {
  // Get step index from pickup since those are the only states we actually have
  const initialStepIdx = STATES.pickup.findIndex((state) => state === status)
  // Map index to faux states
  const states = STATES[fulfillmentType]
  const currentStep = initialStepIdx + 1

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => {
              const title = t.status[fulfillmentType].states[state].title
              const description =
                state === 'IN_TRANSIT' || state === 'SHIPPED'
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
  patientAddress: undefined
}
