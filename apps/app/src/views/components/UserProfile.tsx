import { Avatar, Box, HStack, Text } from '@chakra-ui/react'

import { usePhoton } from '@photonhealth/react'

export const UserProfile = () => {
  const { user } = usePhoton()

  return (
    <HStack spacing="3" ps="2">
      <Avatar name={user?.name} src={user?.image} boxSize="10" />
      <Box>
        <Text fontWeight="medium" fontSize="sm">
          {user?.name}
        </Text>
        <Text color="muted" fontSize="sm">
          {user?.email}
        </Text>
      </Box>
    </HStack>
  )
}
