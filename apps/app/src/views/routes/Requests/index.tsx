import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  SkeletonText,
  Text,
  VStack
} from '@chakra-ui/react';

import { Page } from '../../components/Page';
import { TablePage } from '../../components/TablePage';
import {
  claimRequest,
  DraftRequest,
  fetchDraftRequests,
  getClaimedIds,
  requestsConfig,
  urgencyColorScheme
} from './requests';

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

const columns = [
  { Header: 'Patient', accessor: 'patient', width: 'wrap' },
  { Header: 'Request', accessor: 'request', width: 'wrap' },
  { Header: 'Clinical urgency', accessor: 'urgency' },
  { Header: 'Status', accessor: 'status' },
  { Header: '', accessor: 'actions' }
];

const skeletonRows = new Array(5).fill(0).map(() => ({
  patient: <SkeletonText noOfLines={2} width="120px" />,
  request: <SkeletonText noOfLines={2} width="180px" />,
  urgency: <SkeletonText noOfLines={1} width="100px" />,
  status: <SkeletonText noOfLines={1} width="80px" />,
  actions: <SkeletonText noOfLines={1} width="60px" />
}));

export const useDraftRequests = () => {
  const [requests, setRequests] = useState<DraftRequest[]>([]);
  const [failures, setFailures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { ppToken, draftOrderIds } = requestsConfig();
    setLoading(true);
    try {
      const result = await fetchDraftRequests(draftOrderIds, ppToken);
      setRequests(result.requests);
      setFailures(result.failures);
    } catch (e) {
      setFailures([String((e as Error)?.message ?? e)]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { requests, failures, loading };
};

export const Requests = () => {
  const navigate = useNavigate();
  const { requests, failures, loading } = useDraftRequests();
  const [filterText, setFilterText] = useState('');
  const claimed = useMemo(() => new Set(getClaimedIds()), []);

  const rows = useMemo(() => {
    const filter = filterText.trim().toLowerCase();
    return requests
      .filter(
        (r) =>
          !filter ||
          r.patientName.toLowerCase().includes(filter) ||
          r.medication.toLowerCase().includes(filter)
      )
      .map((request) => {
        const isClaimed = claimed.has(request.id);
        const subtitle = [request.age, request.state].filter((v) => v !== undefined).join(' · ');
        return {
          id: request.id,
          patient: (
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{request.patientName}</Text>
              {subtitle && (
                <Text fontSize="sm" color="gray.500">
                  {subtitle}
                </Text>
              )}
            </VStack>
          ),
          request: (
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{request.medication}</Text>
              {request.reason && (
                <Text fontSize="sm" color="gray.500">
                  {request.reason}
                </Text>
              )}
            </VStack>
          ),
          urgency: <UrgencyBadge urgency={request.urgency} />,
          status: (
            <Badge
              colorScheme={isClaimed ? 'blue' : 'gray'}
              textTransform="none"
              fontWeight="medium"
            >
              {isClaimed ? 'Claimed by you' : 'Unclaimed'}
            </Badge>
          ),
          actions: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                claimRequest(request.id);
                navigate(`/requests/${request.id}`);
              }}
            >
              {isClaimed ? 'Open' : 'Claim'}
            </Button>
          )
        };
      });
  }, [requests, filterText, claimed, navigate]);

  return (
    <Page header="Prescription requests">
      {failures.length > 0 && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            {failures.length === 1
              ? `A request couldn't be loaded: ${failures[0]}`
              : `${failures.length} requests couldn't be loaded: ${failures.join('; ')}`}
          </AlertDescription>
        </Alert>
      )}
      <TablePage
        data={loading ? skeletonRows : rows}
        columns={columns}
        loading={loading}
        filterText={filterText}
        setFilterText={setFilterText}
        hasSearch={!!filterText}
        searchPlaceholder="Search by patient or medication"
        emptyStateTitle="No requests to review"
        emptyStateText="New prescription requests will show up here."
      />
    </Page>
  );
};
