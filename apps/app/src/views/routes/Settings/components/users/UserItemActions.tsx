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
  useDisclosure
} from '@chakra-ui/react';
import { FiEdit, FiMoreVertical, FiTrash } from 'react-icons/fi';
import { EditRolesAction } from './EditRolesAction';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { RemoveUserAction } from './RemoveUserActionItem';

export const userFragment = graphql(/* GraphQL */ `
  fragment UserFragment on User {
    ...RemoveUserActionUserFragment
    ...EditRolesActionUserFragment
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

export const UserItemActions: React.FC<UserItemActionsProps> = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: removeUserIsOpen,
    onOpen: removeUseronOpen,
    onClose: removeUserOnClose
  } = useDisclosure();
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
            Edit User
          </MenuItem>
          <MenuItem icon={<FiTrash fontSize="1.2em" color="red" />} onClick={removeUseronOpen}>
            Remove User
          </MenuItem>
        </MenuList>
      </Menu>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        {isOpen && user && <EditRolesAction user={userData} onClose={onClose}></EditRolesAction>}
      </Modal>
      <Modal isOpen={removeUserIsOpen} onClose={removeUserOnClose} size="xl">
        <ModalOverlay />
        {removeUserIsOpen && user && (
          <RemoveUserAction user={userData} onClose={removeUserOnClose}></RemoveUserAction>
        )}
      </Modal>
    </HStack>
  );
};
