import { Center, Heading, Text, VStack } from '@chakra-ui/react'

export const NoMatch = () => {
  return (
    <Center h="100vh">
      <VStack>
        <Heading>Oops!</Heading>
        <Text>We couldn't find what you're looking for.</Text>
      </VStack>
    </Center>
  )
}
