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

interface UserItemActionsProps {
  userId: string;
  userFullName: string;
  userEmail: string;
  rolesProp: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserItemActions: React.FC<UserItemActionsProps> = ({
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userFullName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userEmail,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rolesProp
}) => {
  console.log('my user id', userId);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <HStack justifyContent="flex-end">
      <Menu>
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
        <EditRolesAction userId={userId} onClose={onClose}></EditRolesAction>
      </Modal>
    </HStack>
  );
};

export default UserItemActions;
