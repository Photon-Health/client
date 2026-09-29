import { Badge, Text, VStack } from '@chakra-ui/react';
import { RequestStatus, urgencyColorScheme } from './requests';

export const UrgencyBadge = ({ urgency }: { urgency?: string }) => (
  <Badge
    colorScheme={urgencyColorScheme(urgency)}
    textTransform="none"
    fontWeight="medium"
    px={2}
    py={0.5}
    borderRadius="md"
  >
    {urgency ?? 'Routine'}
  </Badge>
);

export const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <Badge
    colorScheme={status.colorScheme}
    textTransform="none"
    fontWeight="medium"
    px={2}
    py={0.5}
    borderRadius="md"
  >
    {status.label}
  </Badge>
);

export const SectionLabel = ({ children }: { children: string }) => (
  <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" color="gray.500" mb={4}>
    {children.toUpperCase()}
  </Text>
);

export const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <VStack align="start" spacing={0.5}>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text>{value === undefined || value === null || value === '' ? '—' : value}</Text>
  </VStack>
);
