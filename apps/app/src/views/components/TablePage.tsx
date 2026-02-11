import { ReactElement, ReactNode, Ref, useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  CircularProgress,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FiSearch } from 'react-icons/fi';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { Column, useSortBy, useTable } from 'react-table';

interface TablePageProps {
  loading?: boolean;
  error?: Error;
  data: Array<any>;
  columns: Array<Column>;
  enableSorting?: boolean;
  hideHeaders?: boolean;
  setFilterText: (filter: string) => void;
  filterText: string;
  fetchMoreData?: () => void;
  hasMore?: boolean;
  searchPlaceholder?: string;
  ctaText?: string;
  ctaColor?: string;
  ctaRoute?: string;
  ctaOnClick?: () => void;
  filter?: Element | ReactElement;
  paginationIndicator?: Element | ReactElement;
  paginationActions?: Element | ReactElement;
  total?: number;
  ctaRight?: boolean;
}

export const TablePage = ({
  loading = false,
  error = undefined,
  enableSorting = false,
  hideHeaders = false,
  hasMore = false,
  fetchMoreData = () => null,
  searchPlaceholder = 'Search',
  ctaText = undefined,
  ctaColor = undefined,
  ctaRoute = undefined,
  ctaOnClick = undefined,
  paginationIndicator = undefined,
  paginationActions = undefined,
  total = undefined,
  data,
  columns,
  setFilterText,
  filterText,
  filter,
  ctaRight
}: TablePageProps) => {
  const scrollableContainerRef = useRef(null);
  const handleInputChange = useCallback(
    (e: any) => {
      setFilterText(e.target.value);
    },
    [setFilterText]
  );

  const isMobile = useBreakpointValue({ base: true, md: false });

  data = useMemo(() => data, [data]);
  columns = useMemo(() => columns, [columns]);

  const tableRef: any = useRef();

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    // @ts-ignore
    { columns, data, disableSortBy: !enableSorting },
    useSortBy
  );

  const canRenderCta = ctaRoute && ctaColor && ctaText;

  return (
    <TablePageBox scrollableContainerRef={scrollableContainerRef}>
      <Stack spacing="5">
        <Stack
          px={{ base: '4', md: '6' }}
          pt="5"
          direction={{ base: 'column', md: `row${ctaRight ? '-reverse' : ''}` }}
          justify="space-between"
        >
          {canRenderCta && (
            <Button
              as={ctaOnClick ? undefined : RouterLink}
              to={ctaRoute || ''}
              onClick={ctaOnClick}
              colorScheme={ctaColor}
              aria-label={ctaText}
            >
              {ctaText}
            </Button>
          )}
          <Stack direction={{ base: 'column', md: 'row' }}>
            <>
              {filter ? filter : null}
              <InputGroup maxW={{ base: '100%', md: 'xs' }} minWidth={300}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="muted" boxSize="5" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  onChange={handleInputChange}
                  value={filterText}
                />
              </InputGroup>
            </>
          </Stack>
        </Stack>
        <Box overflowX="auto">
          <InfiniteScroll
            dataLength={rows.length}
            scrollableTarget={scrollableContainerRef.current ?? undefined}
            next={fetchMoreData}
            hasMore={hasMore || false}
            loader={
              rows.length > 0 ? (
                <Table>
                  <Thead>
                    <Tr>
                      <Td>
                        <Center>
                          <CircularProgress isIndeterminate color="green.300" />
                        </Center>
                      </Td>
                    </Tr>
                  </Thead>
                </Table>
              ) : null
            }
          >
            <Table {...getTableProps()} ref={tableRef}>
              <Thead hidden={hideHeaders}>
                {
                  // Loop over the header rows
                  headerGroups.map((headerGroup) => (
                    // Apply the header row props
                    <Tr
                      {...headerGroup.getHeaderGroupProps()}
                      key={headerGroup.getHeaderGroupProps().key}
                    >
                      {
                        // Loop over the headers in each row
                        headerGroup.headers.map((column) => (
                          // Apply the header cell props
                          <Th {...column.getHeaderProps()} key={column.id}>
                            {
                              // Render the header
                              column.render('Header')
                            }
                          </Th>
                        ))
                      }
                    </Tr>
                  ))
                }
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {
                  // Loop over the table rows
                  rows.map((row, idx) => {
                    // Prepare the row for display
                    prepareRow(row);
                    return (
                      // Apply the row props
                      <Tr {...row.getRowProps()} key={`${row.id}-${idx}`}>
                        {
                          // Loop over the rows cells
                          row.cells.map((cell) => {
                            // Apply the cell props
                            const { key, ...otherCellProps } = cell.getCellProps(
                              cell.column.width === 'wrap'
                                ? {
                                    style: {
                                      whiteSpace: 'pre-wrap'
                                    }
                                  }
                                : {}
                            );
                            return (
                              <Td key={key} {...otherCellProps}>
                                {
                                  // Render the cell contents
                                  cell.render('Cell')
                                }
                              </Td>
                            );
                          })
                        }
                      </Tr>
                    );
                  })
                }
              </Tbody>
            </Table>
          </InfiniteScroll>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.message}
            </Alert>
          )}
        </Box>
        <HStack px={{ base: '4', md: '6' }} pb="5" spacing="3" justify="space-between">
          <>
            {!loading && !isMobile && (
              <Text color="muted" fontSize="sm">
                Showing {data.length} results {total ? `(${total} total)` : null}
              </Text>
            )}
            {!isMobile && paginationIndicator}
            {paginationActions}
          </>
        </HStack>
      </Stack>
      <Outlet />
    </TablePageBox>
  );
};

const TablePageBox = ({
  children,
  scrollableContainerRef
}: {
  children: ReactNode;
  scrollableContainerRef: Ref<any>;
}) => {
  return (
    <Box
      w="full"
      bg="white"
      boxShadow={{ base: 'none', md: useColorModeValue('sm', 'sm-dark') }}
      borderRadius={useBreakpointValue({ base: 'lg', md: 'lg' })}
      ref={scrollableContainerRef}
    >
      {children}
    </Box>
  );
};
