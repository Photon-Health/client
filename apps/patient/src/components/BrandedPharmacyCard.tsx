import {
  Card,
  CardBody,
  Image,
  SlideFade,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react'

// @ts-ignore
import capsuleLogo from '../assets/capsule_logo.png'
// @ts-ignore
import amazonPharmacyLogo from '../assets/amazon_pharmacy.png'
// @ts-ignore
import altoLogo from '../assets/alto_logo.svg'

interface Props {
  pharmacyId: string
  selectedId: string
  handleSelect: Function
}

const PHARMACY_BRANDING = {
  [process.env.REACT_APP_CAPSULE_PHARMACY_ID as string]: {
    logo: capsuleLogo,
    description: 'Free, same-day prescription delivery.'
  },
  [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]: {
    logo: amazonPharmacyLogo,
    description: 'Save time. Save money. Stay healthy.'
  },
  [process.env.REACT_APP_ALTO_PHARMACY_ID as string]: {
    logo: altoLogo,
    description: 'Free same-day delivery'
  }
}

export const BrandedPharmacyCard = ({ pharmacyId, selectedId, handleSelect }: Props) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  console.log(pharmacyId)

  const { logo, description } = PHARMACY_BRANDING[pharmacyId]

  if (!logo || !description) return null

  return (
    <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${pharmacyId}`}>
      <Card
        bgColor="white"
        cursor="pointer"
        onClick={() => handleSelect(pharmacyId)}
        border="2px solid"
        borderColor={selectedId === pharmacyId ? 'brand.600' : 'white'}
        mx={isMobile ? -3 : undefined}
      >
        <CardBody p={3}>
          <VStack align="start" spacing={2}>
            <Image src={logo} width="auto" height="30px" />
            <Text fontSize="sm" color="gray.500">
              {description}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </SlideFade>
  )
}
