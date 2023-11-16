import { VStack } from '@chakra-ui/react';

import { InviteList } from '../components/invites/InviteList';
import { UsersList } from '../components/users/UsersList';
export const TeamTab = (props: { rolesMap: Record<string, string> }) => {
  return (
    <VStack spacing={5} align="left">
      <UsersList {...props} />
      <InviteList />
    </VStack>
  );
};
