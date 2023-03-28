import { Card, CardBody, Heading, Image, SlideFade, Text, VStack } from '@chakra-ui/react'

// @ts-ignore
import capsuleLogo from '../assets/capsule_logo.png'

interface Props {
  capsule: boolean
  location: string
  selectedId: string
  handleSelect: Function
}

export const MailOrderOptions = ({ capsule, location, selectedId, handleSelect }: Props) => {
  if (!location) return null

  const mailOrderOptions = [
    {
      id: process.env.REACT_APP_CAPSULE_PHARMACY_ID,
      logo: capsuleLogo,
      enabled: capsule
    }
    // add additional mail order options here
  ]

  return (
    <SlideFade offsetY="60px" in={true}>
      <VStack spacing={3} align="span" w="full">
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            Delivery
          </Heading>
          <Text>Your prescriptions delivered to your door.</Text>
        </VStack>

        {mailOrderOptions.map((ph) => {
          if (!ph.enabled) return null
          return (
            <Card
              w="full"
              bgColor="white"
              cursor="pointer"
              onClick={() => handleSelect(ph.id)}
              border="2px solid"
              borderColor={selectedId === ph.id ? 'brand.600' : 'white'}
            >
              <CardBody p={4}>
                <VStack me="auto" align="start" spacing={2}>
                  <Image src={ph.logo} width="auto" height="25px" />
                  <Text fontSize="sm" color="gray.500">
                    Specialty medications delivered.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )
        })}
      </VStack>
    </SlideFade>
  )
}

MailOrderOptions.defaultProps = {
  capsule: false
}
