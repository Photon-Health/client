import { useQuery } from '@apollo/client';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import { graphql } from 'apps/app/src/gql';
import { Outlet } from 'react-router-dom';
import { useClinicalApiClient } from '../../apollo';
import { UserItem } from './UserItem';
import { InviteForm } from '../invites/InviteForm';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import { useMemo, useState } from 'react';
import { PaginationIndicator } from '../PaginationIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const usersQuery = graphql(/* GraphQL */ `
  query UsersListQuery {
    users {
      id
      ...UserItemFragment
    }
    roles {
      name
      id
    }
  }
`);

export const UsersList = (props: { rolesMap: Record<string, string> }) => {
  const client = useClinicalApiClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, error, loading } = useQuery(usersQuery, { client });

  const hasUsers = usePermissions(['edit:profile', 'read:profile']);
  const hasInvite = usePermissions(['write:invite']);
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });

  // The Pagination component is 1-indexed for some reason
  const [currentPage, setCurrentPage] = useState(1);
  const page = currentPage - 1;
  const PAGE_SIZE = 5;
  const start = page * PAGE_SIZE;
  const pages = Math.ceil((data?.users.length ?? 0) / PAGE_SIZE);

  const total = data?.users.length;
  const users = useMemo(() => data?.users.slice(start, start + PAGE_SIZE), [data?.users, page]);
  const currPageSize = users?.length ?? 0;

  if (!hasUsers) return null;

  if (error) {
    return (
      <Box
        pt={{ base: '4', md: '4' }}
        pb={{ base: '4', md: '8' }}
        px={{ base: '4', md: '8' }}
        borderRadius="lg"
        bg="bg-surface"
        boxShadow="base"
        maxWidth="55em"
      >
        <Container padding={{ base: '0', md: '0' }}>
          <Stack spacing={3}>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="medium">
                Error: Could not load users
              </Text>
              <Alert status="error">
                <AlertIcon />
                {error.message}
              </Alert>
            </HStack>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      pt={{ base: '4', md: '4' }}
      pb={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
    >
      <Container padding={{ base: '0', md: '0' }}>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="medium">
              Users
            </Text>
            {hasInvite && (
              <Button
                onClick={onOpen}
                colorScheme="blue"
                aria-label="Invite user"
                size="sm"
                disabled={isOpen}
              >
                Invite user
              </Button>
            )}
          </HStack>

          <Outlet />
          {loading && (
            <Center padding="100px">
              <CircularProgress isIndeterminate color="green.300" />
            </Center>
          )}
          <InviteForm isOpen={isOpen} onClose={onClose} />
          {users?.length !== 0 && !loading && (
            <TableContainer border={'1px solid var(--chakra-colors-gray-100)'} borderRadius={10}>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users?.map((user) => (
                    <UserItem rolesMap={props.rolesMap} key={user.id} user={user} />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
          <Box px={{ base: '4', md: '6' }} pb="5">
            <HStack spacing="3" justify="space-between">
              <Text color="muted" fontSize="sm">
                Showing {currPageSize} results {total ? `(${total} total)` : null}
              </Text>
              <PaginationIndicator
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
              <HStack
                w={isMobileAndTablet ? '100%' : undefined}
                justifyContent={isMobileAndTablet ? 'space-between' : 'initial'}
              >
                <Button
                  variant="ghost"
                  leftIcon={<ChevronLeftIcon />}
                  disabled={currentPage === 1}
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  rightIcon={<ChevronRightIcon />}
                  disabled={currentPage === pages}
                  isDisabled={currentPage === pages}
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, pages))}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
