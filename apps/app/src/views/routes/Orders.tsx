import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SkeletonCircle,
  SkeletonText,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';

import { FiInfo } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { gql, useQuery } from '@apollo/client';

import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import PatientView from '../components/PatientView';
import PharmacyNameView from '../components/PharmacyNameView';
import { formatDate, getMedicationNames } from '../../utils';
import { Order } from 'packages/sdk/dist/types';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';

const GET_ORDERS = gql`
  query GetOrders($patientId: ID, $patientName: String, $after: ID, $first: Int) {
    orders(
      filter: { patientId: $patientId, patientName: $patientName }
      after: $after
      first: $first
    ) {
      id
      externalId
      state
      createdAt
      fills {
        id
        treatment {
          name
        }
      }
      patient {
        id
        name {
          full
        }
      }
      pharmacy {
        name
        phone
        address {
          street1
          street2
          city
          state
          postalCode
        }
      }
      fulfillment {
        state
      }
    }
  }
`;

interface ActionsProps {
  id: string;
}

const Actions = (props: ActionsProps) => {
  const { id } = props;
  return (
    <HStack spacing="0">
      <IconButton
        icon={<FiInfo fontSize="1.25rem" />}
        variant="ghost"
        aria-label="View Order"
        title="View order details"
        as={RouterLink}
        to={`/orders/${id}`}
      />
    </HStack>
  );
};

const renderRow = (order: Order) => {
  const { id, pharmacy, patient } = order;
  const extId = order.externalId || <Text as="i">None</Text>;

  const medNames = getMedicationNames(order.fills).join(', ');

  const pharmacyView = pharmacy?.name ? (
    <Popover>
      <PopoverTrigger>
        <HStack spacing={0}>
          <Text alignContent="center">{pharmacy.name}</Text>
          <IconButton
            variant="ghost"
            color="gray.500"
            aria-label="View pharmacy details"
            icon={<FiInfo />}
          />
        </HStack>
      </PopoverTrigger>
      <PopoverContent p={1}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody whiteSpace="pre-wrap">
          <PharmacyNameView
            name={pharmacy.name}
            phone={pharmacy.phone}
            address={pharmacy?.address}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <Text as="i">Pending selection</Text>
  );

  return {
    id,
    externalId: extId,
    createdAt: formatDate(order.createdAt),
    fills: <Text fontWeight="medium">{medNames}</Text>,
    status: (
      <OrderStatusBadge
        fulfillmentState={order.fulfillment?.state as OrderFulfillmentState}
        orderState={order.state}
      />
    ),
    patient: <PatientView patient={patient} />,
    pharmacy: pharmacyView,
    actions: <Actions id={id} />
  };
};

const renderSkeletonRow = (isMobile: boolean | undefined) =>
  isMobile
    ? {
        fills: <SkeletonText width="75px" noOfLines={4} spacing="3" />,
        patient: (
          <HStack alignContent="center">
            <SkeletonText noOfLines={2} width="150px" />
          </HStack>
        ),
        status: <SkeletonText noOfLines={1} />,
        pharmacy: <SkeletonText noOfLines={1} />,
        createdAt: <SkeletonText noOfLines={1} />,
        externalId: <SkeletonText noOfLines={1} width="50px" />,
        actions: <SkeletonCircle size="5" />
      }
    : {
        fills: <SkeletonText width="250px" noOfLines={1} spacing="3" />,
        patient: (
          <HStack alignContent="center">
            <SkeletonText noOfLines={2} width="150px" />
          </HStack>
        ),
        status: <SkeletonText noOfLines={1} />,
        pharmacy: <SkeletonText noOfLines={1} />,
        createdAt: <SkeletonText noOfLines={1} />,
        externalId: <SkeletonText noOfLines={1} width="50px" />,
        actions: <SkeletonCircle size="5" />
      };

export const Orders = () => {
  const [params] = useSearchParams();
  const patientId = params.get('patientId');

  const columns = [
    {
      Header: 'Medication',
      accessor: 'fills',
      width: 'wrap'
    },
    {
      Header: 'Patient',
      accessor: 'patient',
      width: 'wrap'
    },
    {
      Header: 'Status',
      accessor: 'status'
    },
    {
      Header: 'Pharmacy',
      accessor: 'pharmacy'
    },
    {
      Header: 'Date',
      accessor: 'createdAt'
    },
    {
      Header: 'Ext. Id',
      accessor: 'externalId'
    },
    {
      Header: '',
      accessor: 'actions'
    }
  ];

  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const getOrdersData = {
    first: 25,
    patientId: patientId ?? undefined,
    patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
  };

  const { data, loading, error, fetchMore, refetch } = useQuery(GET_ORDERS, {
    variables: getOrdersData
  });
  const orders: Order[] | undefined = data?.orders;

  useEffect(() => {
    if (!loading && orders) {
      setRows(orders.map(renderRow));
      setFinished(orders.length === 0);
    }
  }, [loading, orders]);

  useEffect(() => {
    if (filterTextDebounce) {
      refetch({
        patientName: filterTextDebounce
      });
    }
  }, [filterTextDebounce, refetch]);

  const skeletonRows = new Array(25).fill(0).map(() => renderSkeletonRow(isMobile));

  return (
    <Page header="Orders">
      <TablePage
        data={loading ? skeletonRows : rows}
        columns={columns}
        loading={loading}
        error={error}
        ctaText="New Order"
        ctaColor="blue"
        ctaRoute="/orders/new"
        filterText={filterText}
        setFilterText={setFilterText}
        hasMore={rows.length % 25 === 0 && !finished}
        searchPlaceholder="Search by patient name"
        fetchMoreData={async () => {
          if (fetchMore && !loading) {
            await fetchMore({
              variables: {
                ...getOrdersData,
                patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
                after: rows?.at(-1)?.id
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                if (fetchMoreResult.orders.length === 0) {
                  setFinished(true);
                }
                return {
                  ...prev,
                  orders: [...prev.orders, ...fetchMoreResult.orders]
                };
              }
            });
          }
        }}
      />
    </Page>
  );
};
