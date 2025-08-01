import {
  Badge,
  Box,
  Card,
  HStack,
  IconButton,
  LinkBox,
  LinkOverlay,
  SkeletonText,
  Text,
  VStack
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';
import { formatDate } from '../../../../utils';
import { PRESCRIPTION_COLOR_MAP, PRESCRIPTION_STATE_MAP } from '../../Prescriptions';
import SectionTitleRow from '../../../components/SectionTitleRow';

interface PresentablePrescription {
  id: string;
  treatment: {
    name: string;
  };
  state: string;
  writtenAt: string;
}

interface PatientPrescriptionsProps {
  loading: boolean;
  prescriptions: PresentablePrescription[];
}

export const PatientPrescriptions = ({ loading, prescriptions }: PatientPrescriptionsProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(prescriptions.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrescriptions = prescriptions.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const paginationElement =
    totalPages > 1 ? (
      <HStack>
        <IconButton
          aria-label="Previous prescriptions"
          icon={<FiChevronLeft />}
          size="sm"
          variant="outline"
          onClick={goToPreviousPage}
          isDisabled={currentPage === 0}
        />
        <Text fontSize="sm" color="gray.500" mx={2}>
          {currentPage + 1} of {totalPages}
        </Text>
        <IconButton
          aria-label="Next prescriptions"
          icon={<FiChevronRight />}
          size="sm"
          variant="outline"
          onClick={goToNextPage}
          isDisabled={currentPage === totalPages - 1}
        />
      </HStack>
    ) : undefined;

  return (
    <>
      <SectionTitleRow headerText="Prescriptions" rightElement={paginationElement} />

      {loading ? (
        <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
      ) : prescriptions.length === 0 ? (
        <Text as="i" fontSize="sm" color="gray.500">
          No prescriptions
        </Text>
      ) : (
        <VStack spacing={3} align="start">
          {currentPrescriptions.map(({ id: prescriptionId, treatment, state, writtenAt }) => (
            <LinkBox key={prescriptionId} style={{ textDecoration: 'none' }} w="full">
              <Card
                variant="outline"
                p={3}
                shadow="none"
                backgroundColor="gray.50"
                _hover={{ backgroundColor: 'gray.100' }}
              >
                <HStack w="full" justify="space-between">
                  <VStack alignItems="start">
                    <LinkOverlay href={`/prescriptions/${prescriptionId}`}>
                      <Text fontSize="md">{treatment.name}</Text>
                    </LinkOverlay>
                    <HStack>
                      <Badge
                        size="sm"
                        colorScheme={PRESCRIPTION_COLOR_MAP[state as keyof object] || ''}
                      >
                        {PRESCRIPTION_STATE_MAP[state as keyof object] || ''}
                      </Badge>
                      <Text fontSize="md" color="gray.500">
                        {formatDate(writtenAt)}
                      </Text>
                    </HStack>
                  </VStack>
                  <Box alignItems="end">
                    <FiChevronRight size="1.3em" />
                  </Box>
                </HStack>
              </Card>
            </LinkBox>
          ))}
        </VStack>
      )}
    </>
  );
};
