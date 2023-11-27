import { VStack } from '@chakra-ui/react';

import { InviteList } from '../components/invites/InviteList';
import { UsersList } from '../components/users/UsersList';
import usePermissions from 'apps/app/src/hooks/usePermissions';
export const TeamTab = (props: { rolesMap: Record<string, string> }) => {
  const hasInvite = usePermissions(['read:invite']);

  return (
    <VStack spacing={5} align="left">
      <UsersList {...props} />
      {hasInvite && <InviteList />}
    </VStack>
  );
};
