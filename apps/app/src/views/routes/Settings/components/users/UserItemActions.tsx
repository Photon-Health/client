import React from 'react';
import {
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Modal,
  ModalOverlay,
  useDisclosure,
  Box,
  Icon,
  Text,
  useToast
} from '@chakra-ui/react';
import { FiEdit, FiMoreVertical, FiTrash, FiCheckCircle, FiX } from 'react-icons/fi';
import { EditRolesAction } from './EditRolesAction';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { confirmWrapper } from '../../../../components/GuardDialog';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';

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

interface UserItemActionsProps {
  user: FragmentType<typeof userFragment>;
}

const RemoveUserFromOrganizationMutation = graphql(/* GraphQL */ `
  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {
    removeUserFromOrganization(userId: $userId)
  }
`);

export const UserItemActions: React.FC<UserItemActionsProps> = ({ user }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { clinicalClient } = usePhoton();
  const [removeUser, { loading: deleteLoading }] = useMutation(RemoveUserFromOrganizationMutation, {
    client: clinicalClient,
    refetchQueries: ['UsersListQuery']
  });
  const userData = useFragment(userFragment, user);
  return (
    <HStack justifyContent="flex-end">
      <Menu autoSelect={false}>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical fontSize="1.25rem" />}
          variant="ghost"
        />
        <MenuList>
          <MenuItem icon={<FiEdit fontSize="1.2em" />} onClick={onOpen}>
            Edit Roles
          </MenuItem>
          <MenuItem
            icon={<FiTrash fontSize="1.3em" color="red" />}
            disabled={deleteLoading}
            onClick={async () => {
              const decision = await confirmWrapper('Remove user?', {
                description: <Text mb={2}>This will remove user from organization.</Text>,
                cancelText: 'Cancel',
                confirmText: 'Delete',
                colorScheme: 'red'
              });
              if (decision) {
                removeUser({
                  variables: {
                    userId: userData.id
                  }
                });
                toast({
                  position: 'top',
                  // TODO: Override default solid theme with this outline variant
                  render: ({ onClose }) => (
                    <Box
                      color="gray.800"
                      p={4}
                      borderWidth="2px"
                      borderRadius="md"
                      bg="white"
                      borderColor="green.500"
                    >
                      <HStack>
                        <Icon as={FiCheckCircle} color="green.500" boxSize="5" />
                        <Text flex="1">Invite Deleted</Text>
                        <IconButton
                          color="muted"
                          icon={<FiX fontSize="1.25rem" />}
                          variant="ghost"
                          aria-label="close"
                          title="Close"
                          onClick={onClose}
                        />
                      </HStack>
                    </Box>
                  )
                });
              }
            }}
          >
            Remove User
          </MenuItem>
        </MenuList>
      </Menu>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        {isOpen && user && <EditRolesAction user={user} onClose={onClose}></EditRolesAction>}
      </Modal>
    </HStack>
  );
};
