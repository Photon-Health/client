import { Box, Center, Container, Stack } from '@chakra-ui/react'
import { Step } from './components/Step'
import t from '../../utils/text.json'

export const states = ['SENT', 'RECEIVED', 'READY', 'PICKED_UP']

export const StatusStepper = ({ status }) => {
  const initialStepIdx = states.findIndex((state) => state === status)
  const currentStep = initialStepIdx + 1
  return (
    <Box>
      <Container px={0} pt={0}>
        <Center>
          <Stack spacing="0">
            {states.map((state, id) => (
              <Step
                key={state}
                cursor="pointer"
                title={t.status[state].title}
                description={t.status[state].description}
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
