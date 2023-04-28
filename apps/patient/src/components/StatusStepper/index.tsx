import { Box, Center, Container, Stack } from '@chakra-ui/react'
import { Step } from './components/Step'
import t from '../../utils/text.json'
import { FulfillmentType } from '../../utils/models'

export const STATES = {
  courier: ['SENT', 'FILLING', 'IN_TRANSIT', 'DELIVERED'],
  pickup: ['SENT', 'RECEIVED', 'READY', 'PICKED_UP'],
  mailOrder: ['SENT', 'FILLING', 'DELIVERING', 'SHIPPED']
}

interface Props {
  fulfillmentType: FulfillmentType
  status: string
  patientAddress?: string
}

export const StatusStepper = ({ status, fulfillmentType, patientAddress }: Props) => {
  const states = STATES[fulfillmentType]
  const initialStepIdx = states.findIndex((state) => state === status)
  const currentStep = initialStepIdx + 1

  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => {
              const title = t.status[fulfillmentType].states[state].title
              const description =
                state === 'IN_TRANSIT' || state === 'DELIVERING'
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
