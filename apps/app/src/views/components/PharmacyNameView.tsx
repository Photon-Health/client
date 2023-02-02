import { Avatar, Box, HStack, Link, Text } from '@chakra-ui/react'

import { formatPhone, formatAddress } from '../../utils'

interface PharmacyNameViewProps {
  name: string
  phone?: string
  address?: {
    city: string
    country: string
    postalCode: string
    state: string
    street1: string
    street2: string
  }
}

const PharmacyNameView = (props: PharmacyNameViewProps) => {
  const { name, phone, address } = props
  return (
    <HStack spacing="3">
      <Avatar name={name} src="" boxSize="10" />
      <Box>
        <Text fontWeight="medium" color="black">
          {name}
        </Text>
        {phone ? (
          <Link color="muted" href={`tel:${phone}`} isExternal>
            {formatPhone(phone)}
          </Link>
        ) : null}
        {address && Object.keys(address).length ? (
          <Text color="muted">{formatAddress(address)}</Text>
        ) : null}
      </Box>
    </HStack>
  )
}

PharmacyNameView.defaultProps = {
  phone: '',
  address: {
    city: '',
    country: '',
    postalCode: '',
    state: '',
    street1: '',
    street2: ''
  }
}

export default PharmacyNameView
