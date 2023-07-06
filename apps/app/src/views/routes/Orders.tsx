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
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';

import { FiInfo } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePhoton, types } from '@photonhealth/react';

import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import PatientView from '../components/PatientView';
import PharmacyNameView from '../components/PharmacyNameView';
import { formatDate, formatFills } from '../../utils';
import { ORDER_STATE_MAP, ORDER_STATE_ICON_MAP } from './Order';
import { Order } from 'packages/sdk/dist/types';

type OrderFulfillmentState =
  | 'SENT'
  // Pick Up
  | 'RECEIVED'
  | 'READY'
  | 'PICKED_UP'
  // Mail Order
  | 'FILLING'
  | 'SHIPPED'
  | 'DELIVERED';
type OrderFulfillmentRecord = Record<OrderFulfillmentState, string>;

export const ORDER_FULFILLMENT_STATE_MAP: OrderFulfillmentRecord = {
  SENT: 'Sent',
  RECEIVED: 'Received',
  READY: 'Ready',
  PICKED_UP: 'Picked up',
  FILLING: 'Filling',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

export const ORDER_FULFILLMENT_COLOR_MAP: OrderFulfillmentRecord = {
  SENT: 'yellow',
  RECEIVED: 'orange',
  READY: 'green',
  PICKED_UP: 'gray',
  FILLING: 'orange',
  SHIPPED: 'green',
  DELIVERED: 'gray'
};

export const ORDER_FULFILLMENT_TIP_MAP: OrderFulfillmentRecord = {
  SENT: 'Order sent to pharmacy',
  RECEIVED: 'Order received by pharmacy',
  READY: 'Order ready at pharmacy',
  PICKED_UP: 'Order picked up by patient',
  FILLING: 'Mail order being filled',
  SHIPPED: 'Mail order shipped',
  DELIVERED: 'Mail order delivered'
};

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

  const fills = formatFills(order.fills);

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

  let status = '';
  let statusColor = 'gray';
  let statusTip = '';
  let statusIcon;

  if (order.fulfillment?.state) {
    const key = order.fulfillment.state as OrderFulfillmentState;
    status = ORDER_FULFILLMENT_STATE_MAP[key];
    statusTip = ORDER_FULFILLMENT_TIP_MAP[key] || status;
    statusColor = ORDER_FULFILLMENT_COLOR_MAP[key] || statusColor;
  } else {
    const key = order.state as types.OrderState;
    status = ORDER_STATE_MAP[key];
    statusTip = 'Order waiting on patient pharmacy selection';
    statusIcon = ORDER_STATE_ICON_MAP[key];
  }

  return {
    id,
    externalId: extId,
    createdAt: formatDate(order.createdAt),
    fills: <Text fontWeight="medium">{fills}</Text>,
    status: (
      <Tooltip label={statusTip}>
        <Tag size="sm" borderRadius="full" colorScheme={statusColor}>
          {statusIcon ? <TagLeftIcon boxSize="12px" as={statusIcon} /> : null}
          <TagLabel>{status}</TagLabel>
        </Tag>
      </Tooltip>
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
            <SkeletonCircle size="10" />
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
            <SkeletonCircle size="10" />
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

  const { getOrders } = usePhoton();
  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const { orders, loading, error, refetch } = getOrders({
    patientId,
    patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
  });

  useEffect(() => {
    if (!loading) {
      setRows(orders.map(renderRow));
      setFinished(orders.length === 0);
    }
  }, [loading]);

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
          if (refetch) {
            const { data } = await refetch({
              patientId: patientId || undefined,
              patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
              after: rows?.at(-1)?.id
            });
            if (data?.orders.length === 0) {
              setFinished(true);
            }
            setRows(rows.concat(data?.orders.map(renderRow)));
          }
        }}
      />
    </Page>
  );
};
