import { useQuery } from '@apollo/client';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { graphql } from 'apps/app/src/gql';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import { FormEvent, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PaginationIndicator } from '../PaginationIndicator';
import { InviteForm } from '../invites/InviteForm';
import { UserItem } from './UserItem';

const usersQuery = graphql(/* GraphQL */ `
  query UsersListQuery($page: Int, $pageSize: Int, $filter: UsersFilter) {
    userCount(filter: $filter)
    users(pageNum: $page, pageSize: $pageSize, filter: $filter) {
      id
      ...UserItemUserFragment
    }
    roles {
      name
      id
    }
  }
`);

export const UsersList = (props: { rolesMap: Record<string, string> }) => {
  const { clinicalClient } = usePhoton();
  // const [sortBy, setSortBy] = useState<'NAME' | 'ROLES' | 'EMAIL' | undefined>();
  // const [sortByDir, setSortByDir] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const hasUsers = usePermissions(['edit:profile', 'read:profile']);
  const hasInvite = usePermissions(['write:invite']);
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });

  // The Pagination component is 1-indexed for some reason
  const [currentPage, setCurrentPage] = useState(1);
  const [filterInputValue, setFilterInputValue] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const page = currentPage - 1;
  const PAGE_SIZE = 10;
  const filter = nameFilter.trim().length > 0 ? { name: nameFilter } : undefined;
  const { data, error, loading } = useQuery(usersQuery, {
    client: clinicalClient,
    variables: { page, pageSize: PAGE_SIZE, filter }
  });

  const pages = Math.ceil((data?.userCount ?? 0) / PAGE_SIZE);

  const total = data?.userCount;
  // const users = useMemo(
  //   () =>
  //     data?.users
  //       .map((x) => x)
  //       .sort(sortByFn(sortBy, sortByDir))
  //       .slice(start, start + PAGE_SIZE),
  //   [data?.users, page, sortBy, sortByDir]
  // );
  const users = data?.users;
  const currPageSize = users?.length ?? 0;

  // TODO: Add sorting functionality back
  // const handleSort = (key: 'NAME' | 'ROLES' | 'EMAIL') => () => {
  //   if (key === sortBy) {
  //     setSortByDir(!sortByDir);
  //   } else {
  //     setSortByDir(true);
  //     setSortBy(key);
  //   }
  // };

  if (!hasUsers) return null;

  const submitFilterSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameFilter(filterInputValue);
    setCurrentPage(1);
  };

  const handleClearFilterClick = () => {
    setFilterInputValue('');
    setNameFilter('');
    setCurrentPage(1);
  };

  return (
    <Box borderRadius="lg" bg="white" boxShadow="base">
      <Container padding={{ base: '0', md: '0' }}>
        <Stack spacing={3}>
          <HStack justify="space-between" pt={6} pb={2} px={4}>
            <Stack>
              <Text fontSize="xl" fontWeight="medium">
                Users
              </Text>
              <form onSubmit={submitFilterSearch}>
                <HStack>
                  <InputGroup>
                    <Input
                      placeholder="Search by name"
                      aria-label="Search by name"
                      value={filterInputValue}
                      onChange={(e) => setFilterInputValue(e.target.value)}
                      size="sm"
                      width="200px"
                    />
                    {filterInputValue.length > 0 ? (
                      <InputRightElement pointerEvents="all">
                        <IconButton
                          aria-label="Clear search filter"
                          size="xs"
                          variant="ghost"
                          _hover={{ bg: 'transparent' }}
                          onClick={handleClearFilterClick}
                          icon={<CloseIcon w={2} h={2} />}
                          {...props}
                        />
                      </InputRightElement>
                    ) : undefined}
                  </InputGroup>
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </HStack>
              </form>
            </Stack>
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
          {error ? (
            <Alert status="error">
              <AlertIcon />
              <VStack alignItems="start">
                <Text fontWeight="bold">Error: Could not load users</Text>
                <Text>{presentError(error.message)}</Text>
              </VStack>
            </Alert>
          ) : (
            <>
              <Outlet />
              <InviteForm isOpen={isOpen} onClose={onClose} />

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th
                        py={4}
                        // cursor={'pointer'}
                        width={{ lg: '30%' }}
                        // onClick={handleSort('NAME')}
                      >
                        <HStack alignItems={'center'} spacing={2}>
                          <Text userSelect={'none'}>Name</Text>
                          {/* {sortBy === 'NAME' && (sortByDir ? <FaCaretDown /> : <FaCaretUp />)} */}
                        </HStack>
                      </Th>
                      <Th
                        py={4}
                        // cursor={'pointer'}
                        width={{ lg: '30%' }}
                        // onClick={handleSort('EMAIL')}
                      >
                        <HStack alignItems={'center'} spacing={2}>
                          <Text userSelect={'none'}>Email</Text>
                          {/* {sortBy === 'EMAIL' && (sortByDir ? <FaCaretDown /> : <FaCaretUp />)} */}
                        </HStack>
                      </Th>
                      <Th
                        py={4}
                        // cursor={'pointer'}
                        // onClick={handleSort('ROLES')}
                      >
                        <HStack alignItems={'center'} spacing={2}>
                          <Text userSelect={'none'}>Roles</Text>
                          {/* {sortBy === 'ROLES' && (sortByDir ? <FaCaretDown /> : <FaCaretUp />)} */}
                        </HStack>
                      </Th>
                      <Th py={4} cursor={'pointer'}>
                        <HStack alignItems={'center'} spacing={2}></HStack>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading
                      ? new Array(PAGE_SIZE)
                          .fill(0)
                          .map((_, i) => (
                            <UserItem
                              loading
                              rolesMap={props.rolesMap}
                              hasRole={false}
                              key={`loading-${i}`}
                            />
                          ))
                      : users?.map((user) => (
                          <UserItem
                            rolesMap={props.rolesMap}
                            key={user.id}
                            user={user}
                            hasRole={hasUsers}
                          />
                        ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </>
          )}
          {!loading && (
            <Box px={{ base: '4', md: '6' }} pb="5">
              <Stack
                spacing="3"
                justify={isMobileAndTablet ? 'center' : 'space-between'}
                direction={isMobileAndTablet ? 'column' : 'row'}
              >
                <Text color="muted" fontSize="sm" textAlign={isMobileAndTablet ? 'center' : 'left'}>
                  Showing {currPageSize} results {total ? `(${total} total)` : null}
                </Text>
                {!isMobileAndTablet && (
                  <PaginationIndicator
                    pages={pages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                )}
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
                    disabled={pages === 0 || currentPage === pages}
                    isDisabled={pages === 0 || currentPage === pages}
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, pages))}
                  >
                    Next
                  </Button>
                </HStack>
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

const presentError = (message: string) => {
  const AUTH0_REQUIRES_3_CHARS_ERROR_MESSAGE = 'at least 3 chars';
  if (message.includes(AUTH0_REQUIRES_3_CHARS_ERROR_MESSAGE)) {
    return 'Please enter at least 3 characters.';
  }
  return message;
};
