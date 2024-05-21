import { Skeleton, Td, Text, Tr } from '@chakra-ui/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { useMemo } from 'react';
import { UserItemActions, UserItemActionsDisabled } from './UserItemActions';
import { compareRoles } from './utils';

export const userFragment = graphql(/* GraphQL */ `
  fragment UserItemUserFragment on User {
    ...UserFragment
    id
    npi
    phone
    fax
    email
    address {
      street1
      street2
      state
      postalCode
      country
      city
    }
    name {
      first
      full
      last
      middle
      title
    }
    roles {
      description
      id
      name
    }
  }
`);

export const UserItem = ({
  user: data,
  rolesMap,
  hasRole,
  loading
}:
  | {
      user: FragmentType<typeof userFragment>;
      rolesMap: Record<string, string>;
      hasRole: boolean;
      loading?: false;
    }
  | { user?: undefined; rolesMap: Record<string, string>; hasRole: boolean; loading: true }) => {
  const user = useFragment(userFragment, data);

  const roles = useMemo(
    () =>
      user?.roles
        .map(({ id }) => rolesMap[id])
        .filter((r) => r != null)
        .sort(compareRoles)
        .join(', '),
    [user?.roles, rolesMap]
  );

  return (
    <Tr>
      <Td>
        <Skeleton isLoaded={!loading}>
          <Text>{user?.name?.full ?? 'Unknown'}</Text>
        </Skeleton>
      </Td>
      <Td>
        <Skeleton isLoaded={!loading}>{user?.email ?? 'EMAIL'}</Skeleton>
      </Td>
      <Td textOverflow={'ellipsis'}>
        <Skeleton isLoaded={!loading}>{roles ?? 'ROLES'}</Skeleton>
      </Td>
      <Td>
        {user && hasRole ? (
          <UserItemActions user={user}></UserItemActions>
        ) : (
          <UserItemActionsDisabled />
        )}
      </Td>
    </Tr>
  );
};
