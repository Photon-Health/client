import { useMemo, useRef } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  CircularProgress,
  Center,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer
} from '@chakra-ui/react';

import { Column, useTable, useSortBy } from 'react-table';

interface SimpleTableProps {
  loading?: boolean;
  error?: Error;
  data: Array<any>;
  columns: Array<Column>;
  hideHeaders?: boolean;
  useLoadingOverlay?: boolean;
}

export const SimpleTable = (props: SimpleTableProps) => {
  let { data, columns } = props;
  const { loading, error, hideHeaders, useLoadingOverlay } = props;

  data = useMemo(() => data, [data]);
  columns = useMemo(() => columns, [columns]);

  const tableRef: any = useRef();

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    // @ts-ignore
    { columns, data },
    useSortBy
  );

  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      spacing={{ base: '5', lg: '8' }}
      justify="space-between"
    >
      <Box overflowX="auto">
        <TableContainer>
          <Table {...getTableProps()} ref={tableRef} variant="unstyled" size="lg">
            <Thead hidden={hideHeaders}>
              {headerGroups.map((headerGroup) => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <Th {...column.getHeaderProps()}>{column.render('Header')}</Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody
              {...getTableBodyProps()}
              position={loading && useLoadingOverlay ? 'relative' : 'initial'}
            >
              {loading && useLoadingOverlay ? (
                <Tr
                  position="absolute"
                  height="100%"
                  bg="gray.600"
                  width={tableRef.current?.clientWidth || 'auto'}
                  opacity="0.8"
                  display="flex"
                  alignItems="flex-start"
                  justifyContent="center"
                  paddingTop={8}
                >
                  <Td borderBottomWidth={0}>
                    <Center>
                      <CircularProgress isIndeterminate color="green.300" />
                    </Center>
                  </Td>
                </Tr>
              ) : null}
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <Td
                          {...cell.getCellProps(
                            cell.column.width === 'wrap'
                              ? {
                                  style: {
                                    whiteSpace: 'pre-wrap',
                                    paddingLeft: '0',
                                    paddingTop: '1',
                                    paddingBottom: '0'
                                  }
                                }
                              : {
                                  style: {
                                    paddingLeft: '0',
                                    paddingTop: '1',
                                    paddingBottom: '0'
                                  }
                                }
                          )}
                        >
                          {cell.render('Cell')}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
      </Box>
    </Stack>
  );
};

SimpleTable.defaultProps = {
  loading: false,
  error: undefined,
  hideHeaders: false,
  useLoadingOverlay: false
};
