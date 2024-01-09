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
import { FiEdit, FiMoreVertical } from 'react-icons/fi';
import { EditRolesAction } from './EditRolesAction';
import { userFragment } from '../utils/UserFragment';
import { FragmentType } from 'apps/app/src/gql';

interface UserItemActionsProps {
  user?: FragmentType<typeof userFragment>;
}

export const UserItemActions: React.FC<UserItemActionsProps> = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        </MenuList>
      </Menu>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        {isOpen && <EditRolesAction user={user} onClose={onClose}></EditRolesAction>}
      </Modal>
    </HStack>
  );
};
