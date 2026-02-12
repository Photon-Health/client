import {
  Box,
  Button,
  HStack,
  Skeleton,
  SkeletonText,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

import { TablePage } from '../../../../components/TablePage';

import { PaginationIndicator } from '../PaginationIndicator';
import { JSX } from 'react';

const TEMPLATE_COLUMNS = [
  {
    Header: 'Template',
    accessor: 'template',
    width: 'wrap'
  },
  {
    Header: '',
    accessor: 'badge',
    width: '100px'
  },
  {
    Header: '',
    accessor: 'actions'
  }
];

const renderSkeletonRow = (isMobile: boolean | undefined) => {
  return {
    template: isMobile ? (
      <VStack align="left" py={2}>
        <SkeletonText height="25px" noOfLines={2} width="150px" spacing={2} />
        <SkeletonText height="25px" noOfLines={2} width="150px" ps={4} spacing={2} />
      </VStack>
    ) : (
      <VStack align="left" py={2}>
        <SkeletonText noOfLines={1} width="300px" />
        <Box ps={4}>
          <SkeletonText noOfLines={1} width="325px" />
        </Box>
      </VStack>
    ),
    badge: null,
    actions: (
      <HStack spacing={5} justifyContent="flex-end" me={3}>
        <Skeleton height="20px" width="20px" />
      </HStack>
    )
  };
};

interface TemplateTableProps {
  loading: boolean;
  rows: { template: JSX.Element; actions: JSX.Element }[];
  pages: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filterText: string;
  setFilterText: (filter: string) => void;
  setShowModal: {
    on: () => void;
  };
  filterElement: JSX.Element;
  hasSearch?: boolean;
}

export const TemplateTable = ({
  loading,
  rows,
  pages,
  pageSize,
  currentPage,
  setCurrentPage,
  filterText,
  setFilterText,
  setShowModal,
  filterElement,
  hasSearch
}: TemplateTableProps) => {
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });
  const showBadgeStacked = useBreakpointValue({ base: true, md: false });
  const skeletonRows = new Array(isMobileAndTablet ? 3 : 10)
    .fill(0)
    .map(() => renderSkeletonRow(isMobileAndTablet));
  const rowsForPage = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = showBadgeStacked
    ? TEMPLATE_COLUMNS.filter(({ accessor }) => accessor !== 'badge')
    : TEMPLATE_COLUMNS;

  return (
    <TablePage
      data={loading ? skeletonRows : rowsForPage}
      columns={columns}
      filterText={filterText}
      setFilterText={setFilterText}
      loading={loading}
      ctaText={'Create template'}
      ctaColor={'blue'}
      ctaOnClick={setShowModal.on}
      emptyStateTitle="No templates yet"
      emptyStateText="Add medications to your catalog first, then create prescription templates to save time on frequently prescribed meds."
      hasSearch={hasSearch}
      filter={filterElement}
      ctaRight
      paginationIndicator={
        <PaginationIndicator
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      }
      paginationActions={
        <HStack
          w={{ base: '100%', lg: 'unset' }}
          justifyContent={{ base: 'space-between', lg: 'initial' }}
        >
          <Button
            variant="ghost"
            leftIcon={<ChevronLeftIcon />}
            disabled={currentPage <= 1}
            isDisabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            rightIcon={<ChevronRightIcon />}
            disabled={currentPage >= pages}
            isDisabled={currentPage >= pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </HStack>
      }
      total={rows.length}
    />
  );
};
