import {
  Card,
  CardBody,
  Heading,
  Image,
  SlideFade,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react'

import t from '../utils/text.json'

// @ts-ignore
import capsuleLogo from '../assets/capsule_logo.png'

interface Props {
  capsule: boolean
  location: string
  selectedId: string
  handleSelect: Function
  patientAddress: string
}

export const CourierOptions = ({
  capsule,
  location,
  selectedId,
  handleSelect,
  patientAddress
}: Props) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!location) return null

  const courierOptions = [
    {
      id: process.env.REACT_APP_CAPSULE_PHARMACY_ID,
      logo: capsuleLogo,
      enabled: capsule,
      description: 'Free, same-day prescription delivery.'
    }
    // add additional mail order options here
  ]

  return (
    <VStack spacing={3} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {t.pharmacy.courier.heading}
          </Heading>
          <Text size="sm">
            {t.pharmacy.courier.subheading} {patientAddress}
          </Text>
        </VStack>
      </SlideFade>

      {courierOptions.map((ph) => {
        if (!ph.enabled) return null
        return (
          <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${ph.id}`}>
            <Card
              bgColor="white"
              cursor="pointer"
              onClick={() => handleSelect(ph.id)}
              border="2px solid"
              borderColor={selectedId === ph.id ? 'brand.600' : 'white'}
              mx={isMobile ? -3 : undefined}
            >
              <CardBody p={3}>
                <VStack align="start" spacing={2}>
                  <Image src={ph.logo} width="auto" height="25px" />
                  <Text fontSize="sm" color="gray.500">
                    {ph.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SlideFade>
        )
      })}
    </VStack>
  )
}

CourierOptions.defaultProps = {
  capsule: false
}
