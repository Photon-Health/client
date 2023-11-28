import { Badge, Td, Text, Tr } from '@chakra-ui/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';

export const inviteFragment = graphql(/* GraphQL */ `
  fragment InviteFragment on Invite {
    id
    invitee
    inviter
    expired
    expires_at
  }
`);

export const InviteItem = ({ invite: data }: { invite: FragmentType<typeof inviteFragment> }) => {
  const invite = useFragment(inviteFragment, data);

  return (
    <Tr key={invite.id}>
      <Td>
        <Text>{invite.invitee}</Text>
      </Td>
      <Td>
        <Badge size="sm" colorScheme={invite.expired ? 'red' : 'green'}>
          {invite.expired ? 'Expired' : `${new Date(invite.expires_at).toLocaleDateString()}`}
        </Badge>
      </Td>
    </Tr>
  );
};
