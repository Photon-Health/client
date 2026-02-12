import { ReactElement, useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  CircularProgress,
  HStack,
  Icon,
  Image,
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
import emptyStateSvg from './empty-state.svg';

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
  emptyStateTitle?: string;
  emptyStateText?: string;
  hasSearch?: boolean;
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
  ctaRight,
  emptyStateTitle,
  emptyStateText,
  hasSearch
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

  const canRenderCta = ctaColor && ctaText;
  const hasResults = rows.length > 0;

  return (
    <>
      <Box
        w="full"
        bg="white"
        boxShadow={useColorModeValue('sm', 'sm-dark')}
        borderRadius={useBreakpointValue({ base: 'lg', md: 'lg' })}
        ref={scrollableContainerRef}
      >
        <Stack py="5" gap="0">
          <Stack
            px={{ base: '4', md: '6' }}
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
          {/* Infinite scroll functionality breaks if we conditionally render this component
          so it has to live outside the hasResults conditional */}
          <Box pt={hasResults ? '5' : '0'}>
            <InfiniteScroll
              dataLength={rows.length}
              scrollableTarget={scrollableContainerRef.current ?? undefined}
              next={fetchMoreData}
              hasMore={hasMore || false}
              loader={
                hasResults ? (
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
              {hasResults && (
                <Box overflowX="auto">
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
                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      {error.message}
                    </Alert>
                  )}
                </Box>
              )}
            </InfiniteScroll>
          </Box>
          {hasResults && (
            <HStack pt="5" px={{ base: '4', md: '6' }} spacing="3" justify="space-between">
              <>
                {!loading && !isMobile && (
                  <Text color="muted" fontSize="sm">
                    Showing {rows.length} results {total ? `(${total} total)` : null}
                  </Text>
                )}
                {!isMobile && paginationIndicator}
                {paginationActions}
              </>
            </HStack>
          )}
        </Stack>
        <Outlet />
      </Box>
      {!hasResults && (
        <EmptyState title={emptyStateTitle} text={emptyStateText} hasSearch={hasSearch} />
      )}
    </>
  );
};

const EmptyState = ({
  title,
  text,
  hasSearch
}: {
  title?: string;
  text?: string;
  hasSearch?: boolean;
}) => {
  // Table may be empty because:
  // - User has no entities to render as rows
  //   > display bespoke emptyStateTitle and emptyStateText as
  //     helpful prompts for what action to take
  // - User has typed in a search term and filtered results are 0
  //   > emptyStateTitle and emptyStateText are not applicable,
  //     display more relevant text
  const displayTitle = hasSearch ? 'No results found' : title;
  const displayText = hasSearch ? '' : text;

  return (
    // Stack itself needs a set width so the image width doesn't
    // change based on text length
    <HStack w="100%" justify="center">
      <Stack alignItems="center" w="100%" maxW="400px">
        <Image src={emptyStateSvg} w="50%" maxW="176px" />
        <Text fontSize="lg" fontWeight="medium" textAlign="center">
          {displayTitle}
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {displayText}
        </Text>
      </Stack>
    </HStack>
  );
};
