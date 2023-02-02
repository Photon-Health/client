import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons'
import { Box, CloseButton, HStack, Stack, Text, useBreakpointValue, VStack } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { dismissAlert } from '../../stores/alert'

export const Alert = ({
  id,
  type,
  timeoutValue,
  message,
  hide
}: {
  id: string
  timeoutValue: number
  type: 'info' | 'success' | 'error'
  message: string
  hide: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer2: ReturnType<typeof setTimeout>
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'visibility 0s 2s, opacity 2s linear'
        ref.current.style.visibility = 'hidden'
        ref.current.style.opacity = '0'
        timer2 = setTimeout(() => {
          if (ref.current) {
            ref.current.style.display = 'none'
            dismissAlert(id)
          }
        }, 2000)
      }
    }, timeoutValue - 2000)
    return () => {
      clearTimeout(timer)
      if (timer2) {
        clearTimeout(timer2)
      }
    }
  }, [])

  const isMobile = useBreakpointValue({ base: true, md: false })
  return (
    <Box
      display={hide ? 'none' : 'initial'}
      ref={ref}
      w={isMobile ? '75%' : '33%'}
      bg={type === 'error' ? 'red.50' : type === 'info' ? 'blue.50' : 'green.50'}
      color={type === 'error' ? 'red.700' : type === 'info' ? 'blue.700' : 'green.700'}
      px={{ base: '4', md: '3' }}
      py={{ base: '4', md: '2.5' }}
      position="relative"
      borderRadius="md"
      borderWidth={1}
      borderColor={type === 'error' ? 'red.500' : type === 'info' ? 'blue.500' : 'green.500'}
      shadow="xl"
    >
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        spacing={{ base: '3', md: '2' }}
        pb="0.5"
      >
        {!isMobile ? (
          <Stack
            spacing="4"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'start', md: 'center' }}
            width="100%"
          >
            {type === 'error' ? <WarningIcon alignSelf="flex-start" mt={2} /> : null}
            {type === 'info' ? <InfoIcon alignSelf="flex-start" mt={2} /> : null}
            {type === 'success' ? <CheckCircleIcon alignSelf="flex-start" mt={2} /> : null}
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={{ base: '0.5', md: '1.5' }}
              pe={{ base: '4', sm: '0' }}
              width="100%"
            >
              <Text fontWeight="medium" mt={1} w="full">
                {message}
              </Text>
              <CloseButton display="inline-flex" onClick={() => dismissAlert(id)} />
            </Stack>
          </Stack>
        ) : (
          <HStack>
            <VStack pr={3} alignSelf="flex-start" pt={2}>
              {type === 'error' ? <WarningIcon /> : null}
              {type === 'info' ? <InfoIcon /> : null}
              {type === 'success' ? <CheckCircleIcon /> : null}
            </VStack>
            <VStack>
              <Text fontWeight="medium" mt={1} w="full">
                {message}
              </Text>
            </VStack>
            <CloseButton
              display="inline-flex"
              alignSelf="flex-start"
              onClick={() => dismissAlert(id)}
            />
          </HStack>
        )}
      </Stack>
    </Box>
  )
}
