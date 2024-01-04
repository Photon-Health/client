import { Td, Text, Tr } from '@chakra-ui/react';
import React from 'react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { useMemo } from 'react';
import UserItemActions from './UserItemActions';
import { compareRoles } from './utils';

const userFragment = graphql(/* GraphQL */ `
  fragment UserItemFragment on User {
    id
    name {
      full
    }
    roles {
      id
    }
    email
  }
`);

export const UserItem = ({
  user: data,
  rolesMap
}: {
  user: FragmentType<typeof userFragment>;
  rolesMap: Record<string, string>;
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
      <Td>
        <UserItemActions userId={user.id}></UserItemActions>
      </Td>
    </Tr>
  );
};
