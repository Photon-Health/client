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

const TEMPLATE_COLUMNS = [
  {
    Header: 'Template',
    accessor: 'template',
    width: 'wrap'
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
    actions: (
      <HStack spacing={5} justifyContent="flex-end" me={3}>
        <Skeleton height="20px" width="20px" />
      </HStack>
    )
  };
};

interface TemplateTableProps {
  isLoading: boolean;
  rows: any[];
  filteredRows: any[];
  pages: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filterText: string;
  setFilterText: (filter: string) => void;
  setShowModal: {
    on: () => void;
  };
}

export const TemplateTable = ({
  isLoading,
  rows,
  filteredRows,
  pages,
  pageSize,
  currentPage,
  setCurrentPage,
  filterText,
  setFilterText,
  setShowModal
}: TemplateTableProps) => {
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });
  const displayRows = isLoading
    ? new Array(isMobileAndTablet ? 3 : 10).fill(0).map(() => renderSkeletonRow(isMobileAndTablet))
    : filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <TablePage
      data={displayRows}
      columns={TEMPLATE_COLUMNS}
      filterText={filterText}
      setFilterText={setFilterText}
      loading={isLoading}
      ctaText={isMobileAndTablet ? 'New Template' : undefined}
      ctaColor={isMobileAndTablet ? 'blue' : undefined}
      ctaRoute=""
      ctaOnClick={isMobileAndTablet ? setShowModal.on : undefined}
      paginationIndicator={
        <PaginationIndicator
          pages={pages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      }
      paginationActions={
        <HStack
          w={isMobileAndTablet ? '100%' : undefined}
          justifyContent={isMobileAndTablet ? 'space-between' : 'initial'}
        >
          <Button
            variant="ghost"
            leftIcon={<ChevronLeftIcon />}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            rightIcon={<ChevronRightIcon />}
            disabled={pages === 1 || currentPage === pages}
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