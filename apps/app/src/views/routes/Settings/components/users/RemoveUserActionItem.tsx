import React from 'react';
import {
  ModalContent,
  ModalHeader,
  ModalBody,
  Alert,
  AlertIcon,
  Text,
  Box,
  useToast,
  ModalFooter,
  VStack,
  HStack,
  Button
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';

export const userFragment = graphql(/* GraphQL */ `
  fragment RemoveUserActionUserFragment on User {
    id
    email
    name {
      first
      full
      last
      middle
      title
    }
  }
`);

interface RemoveUserActionProps {
  user: FragmentType<typeof userFragment>;
  onClose: () => void;
}

const RemoveUserFromOrganizationMutation = graphql(/* GraphQL */ `
  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {
    removeUserFromOrganization(userId: $userId)
  }
`);

export const RemoveUserAction: React.FC<RemoveUserActionProps> = ({ user, onClose }) => {
  const toast = useToast();
  const { clinicalClient } = usePhoton();
  const userData = useFragment(userFragment, user);
  const [removeUser, { error }] = useMutation(RemoveUserFromOrganizationMutation, {
    client: clinicalClient,
    refetchQueries: ['UsersListQuery']
  });

  const handleRemoveUser = async () => {
    await removeUser({
      variables: {
        userId: userData.id
      }
    });
    onClose();
    toast({
      position: 'top-right',
      duration: 4000,
      render: ({ onClose }) => (
        <StyledToast onClose={onClose} type="success" description="User Removed" />
      )
    });
  };

  return (
    <ModalContent>
      <ModalHeader>
        <VStack spacing={3} align="stretch">
          <Text fontSize="bg">Assign roles to user</Text>
          <Text fontSize="sm" color="gray.500">
            This user will be removed from your organization immediately. You cannot undo this
            action.
          </Text>
        </VStack>
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
        <Box
          px="0"
          border={'1px solid var(--chakra-colors-gray-100)'}
          backgroundColor="gray.100"
          boxShadow={'base'}
          borderRadius={10}
        >
          <VStack m={3} mt={2} p={[2, 2]} spacing={2} align="stretch">
            <Text fontSize="md" fontWeight={'semibold'}>
              {userData?.name?.full}
            </Text>
            <Text fontSize="sm">{userData?.email}</Text>
          </VStack>
        </Box>
      </ModalBody>
      <ModalFooter>
        <VStack>
          <HStack>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" colorScheme="red" onClick={handleRemoveUser}>
              Remove
            </Button>
          </HStack>
        </VStack>
      </ModalFooter>
    </ModalContent>
  );
};
