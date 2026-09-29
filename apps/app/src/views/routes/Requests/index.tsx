import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  HStack,
  SkeletonText,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack
} from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';

import { Page } from '../../components/Page';
import { TablePage } from '../../components/TablePage';
import { StatusBadge, UrgencyBadge } from './components';
import {
  claimRequest,
  describeRequest,
  DraftOrderSummary,
  fetchRequestCounts,
  fetchRequests,
  formatSubmitted,
  REQUEST_TABS,
  RequestCounts,
  RequestTabKey,
  requestStatus
} from './requests';

const columns = [
  { Header: 'Patient', accessor: 'patient', width: 'wrap' },
  { Header: 'Request', accessor: 'request', width: 'wrap' },
  { Header: 'Submitted', accessor: 'submitted' },
  { Header: 'Clinical urgency', accessor: 'urgency' },
  { Header: 'Status', accessor: 'status' },
  { Header: '', accessor: 'actions' }
];

const skeletonRows = new Array(5).fill(0).map(() => ({
  patient: <SkeletonText noOfLines={2} width="120px" />,
  request: <SkeletonText noOfLines={2} width="180px" />,
  submitted: <SkeletonText noOfLines={1} width="70px" />,
  urgency: <SkeletonText noOfLines={1} width="100px" />,
  status: <SkeletonText noOfLines={1} width="80px" />,
  actions: <SkeletonText noOfLines={1} width="60px" />
}));

const isTabKey = (value: string | null): value is RequestTabKey =>
  REQUEST_TABS.some((tab) => tab.key === value);

const useRequestTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('tab');
  const tab: RequestTabKey = isTabKey(param) ? param : 'to-review';
  const setTab = (next: RequestTabKey) => setSearchParams({ tab: next }, { replace: true });
  return { tab, setTab };
};

const useRequests = (tab: RequestTabKey) => {
  const { getToken } = usePhoton();
  const [requests, setRequests] = useState<DraftOrderSummary[]>([]);
  const [counts, setCounts] = useState<RequestCounts>();
  const [cursor, setCursor] = useState<{ endCursor?: string | null; hasNextPage: boolean }>({
    hasNextPage: false
  });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (after?: string | null) => {
      setError(undefined);
      if (!after) setLoading(true);
      try {
        const token = await getToken();
        const [page, nextCounts] = await Promise.all([
          fetchRequests(tab, token, after),
          after ? Promise.resolve(undefined) : fetchRequestCounts(token)
        ]);
        setRequests((current) => (after ? [...current, ...page.nodes] : page.nodes));
        setCursor({ endCursor: page.endCursor, hasNextPage: page.hasNextPage });
        if (nextCounts) setCounts(nextCounts);
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      } finally {
        setLoading(false);
      }
    },
    [getToken, tab]
  );

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = () => {
    if (cursor.hasNextPage) load(cursor.endCursor);
  };

  return { requests, counts, error, loading, hasMore: cursor.hasNextPage, loadMore };
};

export const Requests = () => {
  const navigate = useNavigate();
  const { getToken } = usePhoton();
  const { tab, setTab } = useRequestTab();
  const { requests, counts, error, loading, hasMore, loadMore } = useRequests(tab);
  const [filterText, setFilterText] = useState('');
  const [claimingId, setClaimingId] = useState<string>();
  const [claimError, setClaimError] = useState<string>();

  const claim = useCallback(
    async (id: string) => {
      setClaimingId(id);
      setClaimError(undefined);
      try {
        await claimRequest(id, await getToken());
        navigate(`/requests/${id}`);
      } catch (e) {
        setClaimError(String((e as Error)?.message ?? e));
        setClaimingId(undefined);
      }
    },
    [getToken, navigate]
  );

  const rows = useMemo(() => {
    const filter = filterText.trim().toLowerCase();
    return requests
      .map((draft) => ({ draft, request: describeRequest(draft) }))
      .filter(
        ({ request }) =>
          !filter ||
          request.patientName.toLowerCase().includes(filter) ||
          request.medication.toLowerCase().includes(filter)
      )
      .map(({ draft, request }) => {
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
          submitted: <Text>{formatSubmitted(request.submittedAt)}</Text>,
          urgency: <UrgencyBadge urgency={request.urgency} />,
          status: <StatusBadge status={requestStatus(draft)} />,
          actions: draft.claim ? (
            <Button variant="outline" size="sm" onClick={() => navigate(`/requests/${request.id}`)}>
              Open
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLoading={claimingId === request.id}
              isDisabled={!!claimingId}
              onClick={() => claim(request.id)}
            >
              Claim
            </Button>
          )
        };
      });
  }, [requests, filterText, claimingId, claim, navigate]);

  const tabIndex = REQUEST_TABS.findIndex((t) => t.key === tab);

  return (
    <Page header="Prescription requests">
      <Tabs
        index={tabIndex}
        onChange={(index) => setTab(REQUEST_TABS[index].key)}
        variant="soft-rounded"
        colorScheme="blue"
      >
        <TabList flexWrap="wrap" gap={2}>
          {REQUEST_TABS.map(({ key, label }) => (
            <Tab key={key}>
              <HStack spacing={2}>
                <Text>{label}</Text>
                {counts && <Badge borderRadius="md">{counts[key]}</Badge>}
              </HStack>
            </Tab>
          ))}
        </TabList>
      </Tabs>
      {(error || claimError) && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            {claimError ?? `Requests couldn't be loaded: ${error}`}
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
        fetchMoreData={loadMore}
        hasMore={hasMore}
        searchPlaceholder="Search by patient or medication"
        emptyStateTitle="No requests here"
        emptyStateText="Prescription requests from patients will show up here."
      />
    </Page>
  );
};
