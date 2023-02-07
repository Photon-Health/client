import { HStack, Button, Text } from '@chakra-ui/react';

interface PaginationIndicatorProps {
  pages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function PaginationIndicator({
  pages,
  currentPage,
  setCurrentPage
}: PaginationIndicatorProps) {
  return (
    <HStack>
      {[...Array(pages).keys()].map((x) =>
        x + 1 >= pages - 1 || x + 1 <= 2 || currentPage === x + 1 ? (
          <Button
            key={x}
            variant="ghost"
            isActive={currentPage === x + 1}
            onClick={() => setCurrentPage(x + 1)}
          >
            {x + 1}
          </Button>
        ) : (currentPage > 2 && x + 2 === currentPage) ||
          (currentPage > 2 && x === currentPage) ||
          (currentPage <= 2 && x + 1 === Math.ceil(pages / 2)) ||
          (currentPage === pages && x + 1 === Math.ceil(pages / 2)) ? (
          <Text key={x}>...</Text>
        ) : null
      )}
    </HStack>
  );
}
