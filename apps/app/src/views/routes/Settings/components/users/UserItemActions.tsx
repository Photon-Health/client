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
  refetch: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserItemActions: React.FC<UserItemActionsProps> = ({ userId, refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const close = () => {
    refetch;
    onClose();
  };
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
        {isOpen && <EditRolesAction userId={userId} onClose={close}></EditRolesAction>}
      </Modal>
    </HStack>
  );
};

export default UserItemActions;
