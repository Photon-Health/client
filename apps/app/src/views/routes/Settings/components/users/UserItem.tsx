import { Td, Text, Tr } from '@chakra-ui/react';
import { FragmentType, useFragment } from 'apps/app/src/gql';
import { useMemo } from 'react';
import { UserItemActions } from './UserItemActions';
import { compareRoles } from './utils';
import { userFragment } from '../utils/UserFragment';

export const UserItem = ({
  user: data,
  rolesMap,
  hasRole
}: {
  user: FragmentType<typeof userFragment>;
  rolesMap: Record<string, string>;
  hasRole: boolean;
}) => {
  const user = useFragment(userFragment, data);

  const roles = useMemo(
    () =>
      user.roles
        .map(({ id }) => rolesMap[id])
        .filter((r) => r != null)
        .sort(compareRoles)
        .join(', '),
    [user.roles]
  );

  return (
    <Tr key={user.id}>
      <Td>
        <Text>{user.name?.full ?? 'Unknown'}</Text>
      </Td>
      <Td>{user.email}</Td>
      <Td textOverflow={'ellipsis'}>{roles}</Td>
      {!hasRole ? null : (
        <Td>
          <UserItemActions user={data}></UserItemActions>
        </Td>
      )}
    </Tr>
  );
};
