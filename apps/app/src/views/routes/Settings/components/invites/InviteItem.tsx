import { Badge, Td, Text, Tr, HStack, IconButton, useToast } from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { InvitesQueryDocument } from 'apps/app/src/gql/graphql';
import { FiSend, FiTrash } from 'react-icons/fi';
import { confirmWrapper } from '../../../../components/GuardDialog';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';

export const inviteFragment = graphql(/* GraphQL */ `
  fragment InviteFragment on Invite {
    id
    invitee
    inviter
    expired
    expires_at
  }
`);

const ResendInviteUserMutation = graphql(/* GraphQL */ `
  mutation ResendInvite($inviteId: ID!) {
    resendInvite(inviteId: $inviteId) {
      id
    }
  }
`);

const DeleteInviteUserMutation = graphql(/* GraphQL */ `
  mutation DeleteInvite($inviteId: ID!) {
    deleteInvite(inviteId: $inviteId)
  }
`);

export const InviteItem = ({ invite: data }: { invite: FragmentType<typeof inviteFragment> }) => {
  const toast = useToast();
  const invite = useFragment(inviteFragment, data);
  const { clinicalClient } = usePhoton();

  const [deleteInvite, { loading: deleteLoading }] = useMutation(DeleteInviteUserMutation, {
    client: clinicalClient,
    refetchQueries: [InvitesQueryDocument]
  });

  const [resendInvite, { loading: resendLoading }] = useMutation(ResendInviteUserMutation, {
    client: clinicalClient,
    refetchQueries: [InvitesQueryDocument]
  });

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
      <Td>
        <HStack spacing="0" justify="end">
          <IconButton
            icon={<FiSend fontSize="1.25rem" />}
            variant="ghost"
            aria-label="Resend Invite"
            title="Resend Invite"
            isDisabled={resendLoading || deleteLoading}
            onClick={async () => {
              const decision = await confirmWrapper('Resend Invite?', {
                description: <Text mb={2}>The user will receive a new signup link via email.</Text>,
                cancelText: "No, Don't Resend",
                confirmText: 'Yes, Resend',
                colorScheme: 'blue'
              });
              if (decision) {
                resendInvite({
                  variables: {
                    inviteId: invite.id
                  }
                });
                toast({
                  position: 'top-right',
                  duration: 4000,
                  render: ({ onClose }) => (
                    <StyledToast onClose={onClose} type="success" description="Invite Resent" />
                  )
                });
              }
            }}
            colorScheme="green"
          />
          <IconButton
            icon={<FiTrash fontSize="1.25rem" color="red" />}
            variant="ghost"
            aria-label="Delete Invite"
            title="Delete Invite"
            isDisabled={resendLoading || deleteLoading}
            onClick={async () => {
              const decision = await confirmWrapper('Delete current invite?', {
                description: (
                  <Text mb={2}>
                    This will disable the current invite and remove it from the list.
                  </Text>
                ),
                cancelText: 'Cancel',
                confirmText: 'Delete',
                colorScheme: 'red'
              });
              if (decision) {
                deleteInvite({
                  variables: {
                    inviteId: invite.id
                  }
                });
                toast({
                  position: 'top-right',
                  duration: 4000,
                  render: ({ onClose }) => (
                    <StyledToast onClose={onClose} type="success" description="Invite Deleted" />
                  )
                });
              }
            }}
            colorScheme="red"
          />
        </HStack>
      </Td>
    </Tr>
  );
};
