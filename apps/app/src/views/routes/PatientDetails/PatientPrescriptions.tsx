import {
  Badge,
  Box,
  Card,
  HStack,
  LinkBox,
  LinkOverlay,
  SkeletonText,
  Text,
  VStack
} from '@chakra-ui/react';
import { FiChevronRight } from 'react-icons/fi';
import { formatDate } from '../../../utils';
import { PRESCRIPTION_COLOR_MAP, PRESCRIPTION_STATE_MAP } from '../Prescriptions';
import SectionTitleRow from '../../components/SectionTitleRow';

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
  return (
    <>
      <SectionTitleRow headerText="Prescriptions" />

      {loading ? (
        <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
      ) : prescriptions.length === 0 ? (
        <Text as="i" fontSize="sm" color="gray.500">
          No prescriptions
        </Text>
      ) : (
        <VStack spacing={3} align="start">
          {prescriptions.map(({ id: prescriptionId, treatment, state, writtenAt }, i) =>
            i < 5 ? (
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
            ) : null
          )}
        </VStack>
      )}
    </>
  );
};
