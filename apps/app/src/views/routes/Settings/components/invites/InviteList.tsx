import { useQuery } from '@apollo/client';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
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
  useBreakpointValue
} from '@chakra-ui/react';
import { graphql } from 'apps/app/src/gql';
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useClinicalApiClient } from '../../apollo';
import { PaginationIndicator } from '../PaginationIndicator';
import { InviteItem } from './InviteItem';

const invitesQuery = graphql(/* GraphQL */ `
  query InvitesQuery {
    invites {
      ...InviteFragment
      id
      expired
      expires_at
    }
  }
`);

const dateDiffInDays = (d1: Date, d2: Date) => {
  return (d1.getTime() - d2.getTime()) / 1000 / 60 / 60 / 24;
};

export const InviteList = () => {
  const client = useClinicalApiClient();
  const { data, error, loading } = useQuery(invitesQuery, { client });

  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });

  // The Pagination component is 1-indexed for some reason
  const [currentPage, setCurrentPage] = useState(1);
  const page = currentPage - 1;
  const PAGE_SIZE = 5;
  const start = page * PAGE_SIZE;
  const allInvites = useMemo(
    () =>
      data?.invites
        .filter(
          (i) => !i.expired || dateDiffInDays(new Date(), new Date(i.expires_at as string)) < 30
        )
        .sort((a, b) => (b.expires_at as string).localeCompare(a.expires_at as string)),
    [data?.invites]
  );
  const pages = Math.ceil((allInvites?.length ?? 0) / PAGE_SIZE);

  const total = allInvites?.length ?? 0;

  const invites = useMemo(() => allInvites?.slice(start, start + PAGE_SIZE), [allInvites, page]);
  const currPageSize = invites?.length ?? 0;

  if (error) {
    return (
      <Box py="4" px={{ base: '4', md: '8' }} borderRadius="lg" bg="bg-surface" boxShadow="base">
        <Container padding={{ base: '0', md: '0' }}>
          <Stack spacing={3}>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="medium">
                Error: Could not load invites
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
              Invites
            </Text>
          </HStack>
          <Outlet />
          {loading && (
            <Center padding="100px">
              <CircularProgress isIndeterminate color="green.300" />
            </Center>
          )}
          {invites?.length !== 0 && !loading && (
            <TableContainer border={'1px solid var(--chakra-colors-gray-100)'} borderRadius={10}>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Email</Th>
                    <Th>Expires</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {invites?.map((invite) => (
                    <InviteItem key={invite.id} invite={invite} />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
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
                  disabled={currentPage === pages}
                  isDisabled={currentPage === pages}
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, pages))}
                >
                  Next
                </Button>
              </HStack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
