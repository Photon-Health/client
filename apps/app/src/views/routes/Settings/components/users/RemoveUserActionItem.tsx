// RemoveUserMenuItem.tsx
import React from 'react';
import { MenuItem, useColorMode, useToast } from '@chakra-ui/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { FiTrash } from 'react-icons/fi';
import { confirmWrapper } from '../../../../components/GuardDialog';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';

export const userFragment = graphql(/* GraphQL */ `
  fragment UserFragment on User {
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

interface RemoveUserMenuItemProps {
  user: FragmentType<typeof userFragment>;
  onDelete: () => void;
}

const RemoveUserFromOrganizationMutation = graphql(/* GraphQL */ `
  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {
    removeUserFromOrganization(userId: $userId)
  }
`);

const RemoveUserMenuItem: React.FC<RemoveUserMenuItemProps> = ({ user, onDelete }) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { clinicalClient } = usePhoton();
  const userData = useFragment(userFragment, user);
  const [removeUser, { loading: deleteLoading }] = useMutation(RemoveUserFromOrganizationMutation, {
    client: clinicalClient,
    refetchQueries: ['UsersListQuery']
  });

  const handleRemoveUser = async () => {
    const decision = await confirmWrapper('Remove user?', {
      description: `user - ${userData.name?.full} will be removed from your organization`,
      cancelText: 'Cancel',
      confirmText: 'Yes, Remove',
      darkMode: colorMode !== 'light',
      colorScheme: 'red'
    });

    if (decision) {
      await removeUser({
        variables: {
          userId: userData.id
        }
      });
      onDelete();
      toast({
        position: 'top-right',
        duration: 4000,
        render: ({ onClose }) => (
          <StyledToast onClose={onClose} type="success" description="Profile updated" />
        )
      });
    }
  };

  return (
    <MenuItem
      icon={<FiTrash fontSize="1.3em" color="red" />}
      disabled={deleteLoading}
      onClick={handleRemoveUser}
    >
      Remove User
    </MenuItem>
  );
};

export default RemoveUserMenuItem;
