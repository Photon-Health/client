import { Avatar, Box, HStack, Text } from '@chakra-ui/react';

import { usePhoton } from 'packages/react';

export const UserProfile = () => {
  const { user } = usePhoton();

  return (
    <HStack spacing="3" ps="2">
      <Avatar
        name={typeof user?.name === 'string' ? user.name : ''}
        src={typeof user?.image === 'string' ? user.image : ''}
        boxSize="10"
      />
      <Box>
        <Text fontWeight="medium" fontSize="sm">
          {user?.name}
        </Text>
        <Text color="muted" fontSize="sm">
          {user?.email}
        </Text>
      </Box>
    </HStack>
  );
};
