import { Link as RouterLink, useLocation, useSearchParams, useNavigate } from 'react-router-dom';

import {
  Badge,
  Select,
  HStack,
  IconButton,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { FiInfo, FiShoppingCart } from 'react-icons/fi';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePhoton } from '@photonhealth/react';
import { formatDate } from '../../utils';

import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import NameView from '../components/NameView';
import PatientView from '../components/PatientView';
import { types } from '@photonhealth/sdk';

interface MedViewProps {
  name: string;
}

const MedView = (props: MedViewProps) => {
  const { name } = props;
  return (
    <Stack spacing="0">
      <Text fontWeight="medium">{name}</Text>
    </Stack>
  );
};

interface ActionsViewProps {
  prescriptionId: string;
  patientId: string;
  disableCreateOrder: boolean;
}

const ActionsView = (props: ActionsViewProps) => {
  const { prescriptionId, patientId, disableCreateOrder = false } = props;
  return (
    <HStack spacing="0">
      <IconButton
        icon={<FiInfo fontSize="1.25rem" />}
        variant="ghost"
        aria-label="View prescription details"
        title="View prescription details"
        as={RouterLink}
        to={`/prescriptions/${prescriptionId}`}
      />
      <IconButton
        icon={<FiShoppingCart fontSize="1.25rem" />}
        variant="ghost"
        aria-label="Create Order"
        title="Create Order"
        as={RouterLink}
        to={`/orders/new?patientId=${patientId}&prescriptionIds=${prescriptionId}`}
        isDisabled={disableCreateOrder}
      />
    </HStack>
  );
};

type PrescriptionState =
  | 'READY' // TODO: delete
  | 'PROCESSING' // TODO: delete
  | 'ACTIVE'
  | 'DEPLETED'
  | 'EXPIRED'
  | 'CANCELED'
  | 'ERROR';
export type PrescriptionStateRecord = Record<PrescriptionState, string>;

export const PRESCRIPTION_STATE_MAP: PrescriptionStateRecord = {
  READY: 'Active',
  PROCESSING: 'Active',
  ACTIVE: 'Active',
  DEPLETED: 'Depleted',
  EXPIRED: 'Expired',
  CANCELED: 'Canceled',
  ERROR: 'Error'
};

export const PRESCRIPTION_COLOR_MAP: PrescriptionStateRecord = {
  READY: 'green',
  PROCESSING: 'yellow',
  ACTIVE: 'green',
  DEPLETED: 'red',
  EXPIRED: 'red',
  CANCELED: 'gray',
  ERROR: 'red'
};

export const PRESCRIPTION_TIP_MAP: PrescriptionStateRecord = {
  READY: 'Prescription has active fills',
  PROCESSING: 'Prescription has active fills',
  ACTIVE: 'Prescription has unused fills',
  DEPLETED: 'All fills have been sent to a pharmacy',
  EXPIRED: 'All fills have passed prescription expiration date',
  CANCELED: 'Prescription has been cancelled',
  ERROR: 'There’s an error with prescription'
};

const renderRow = (rx: any) => {
  const { id, patient } = rx;
  const med = rx.treatment;
  const extId = rx.externalId || <Text as="i">None</Text>;
  const prescriber = rx.prescriber.name.full;
  const writtenAt = formatDate(rx.writtenAt);

  const state = PRESCRIPTION_STATE_MAP[rx.state as keyof PrescriptionStateRecord] || '';
  const stateColor = PRESCRIPTION_COLOR_MAP[rx.state as keyof PrescriptionStateRecord] || '';
  const stateTip = PRESCRIPTION_TIP_MAP[rx.state as keyof PrescriptionStateRecord] || '';

  return {
    id,
    externalId: extId,
    medication: <MedView name={med.name} />,
    quantity: (
      <Text>
        {rx.dispenseQuantity} ct / {rx.daysSupply} day
      </Text>
    ),
    patient: <PatientView patient={patient} />,
    fills: (
      <Text>
        {rx.fillsRemaining} of {rx.fillsAllowed}
      </Text>
    ),
    status: (
      <Tooltip label={stateTip}>
        <Badge size="sm" colorScheme={stateColor}>
          {state}
        </Badge>
      </Tooltip>
    ),
    prescriber: <NameView name={prescriber} />,
    writtenAt: <Text>{writtenAt}</Text>,
    actions: (
      <ActionsView
        prescriptionId={id}
        patientId={rx.patient.id}
        disableCreateOrder={rx.state === types.PrescriptionState.Depleted}
      />
    )
  };
};

export const renderSkeletonRow = () => ({
  medication: <SkeletonText noOfLines={2} spacing="3" width="160px" />,
  quantity: <SkeletonText noOfLines={1} width="80px" />,
  patient: (
    <HStack>
      <SkeletonCircle size="10" />
      <Skeleton height="8px" width="100px" />
    </HStack>
  ),
  fills: <SkeletonText noOfLines={1} />,
  status: <SkeletonText noOfLines={1} />,
  prescriber: (
    <HStack>
      <SkeletonCircle size="10" />
      <Skeleton height="8px" width="100px" />
    </HStack>
  ),
  writtenAt: <SkeletonText noOfLines={1} />,
  actions: (
    <HStack spacing={5} justifyContent="flex-end" me={3}>
      <SkeletonCircle size="5" />
      <Skeleton height="20px" width="20px" />
    </HStack>
  )
});

const convertStatusQuery = (status: string | null): types.PrescriptionState | undefined => {
  if (!status) {
    return undefined;
  }
  const isValidStatus = Object.values(types.PrescriptionState).includes(
    status.toUpperCase() as types.PrescriptionState
  );
  return isValidStatus ? (status.toUpperCase() as types.PrescriptionState) : undefined;
};

export const Prescriptions = () => {
  const location = useLocation();
  const queryStatus = new URLSearchParams(location.search).get('status');
  const navigate = useNavigate();

  const [status, setStatus] = useState<types.PrescriptionState | undefined>(
    convertStatusQuery(queryStatus)
  );
  const [filterChangeLoading, setFilterChangeLoading] = useState(false);
  const [params] = useSearchParams();
  const patientId = params.get('patientId');
  const prescriberId = params.get('prescriberId');

  const columns = [
    {
      Header: 'Medication',
      accessor: 'medication',
      width: 'wrap'
    },
    {
      Header: 'Quantity',
      accessor: 'quantity'
    },
    {
      Header: 'Patient',
      accessor: 'patient',
      width: 'wrap'
    },
    {
      Header: 'Fills',
      accessor: 'fills'
    },
    {
      Header: 'Status',
      accessor: 'status'
    },
    {
      Header: 'Prescriber',
      accessor: 'prescriber',
      width: 'wrap'
    },
    {
      Header: 'Date Written',
      accessor: 'writtenAt'
    },
    {
      Header: '',
      accessor: 'actions'
    }
  ];

  const { getPrescriptions } = usePhoton();
  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const getPrescriptionsData = {
    patientId: patientId || undefined,
    prescriberId: prescriberId || undefined,
    state: status,
    patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
  };

  const { prescriptions, loading, error, refetch } = getPrescriptions(getPrescriptionsData);

  useEffect(() => {
    if (!loading) {
      const preppedRows = prescriptions.filter((row) => row).map(renderRow);
      setRows(preppedRows);
      setFinished(prescriptions.length === 0);
    }
  }, [loading, prescriptions]);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    async function refetchData() {
      setRows([]);
      setFilterChangeLoading(true);
      const { data } = await refetch(getPrescriptionsData);
      setFilterChangeLoading(false);
      if (data?.prescriptions.length === 0) {
        setFinished(true);
      }
      setRows(data?.prescriptions.map(renderRow));
    }

    if (status) {
      navigate({
        search: status ? `?status=${status}` : ''
      });

      refetchData();
    }
  }, [status, navigate]);

  const skeletonRows = new Array(25).fill(0).map(renderSkeletonRow);

  return (
    <Page header="Prescriptions">
      <TablePage
        data={loading || filterChangeLoading ? skeletonRows : rows}
        columns={columns}
        loading={loading}
        error={error}
        ctaText="New Prescription"
        ctaColor="green"
        ctaRoute="/prescriptions/new"
        filterText={filterText}
        setFilterText={setFilterText}
        hasMore={rows.length % 25 === 0 && !finished}
        searchPlaceholder="Search by patient name"
        filter={
          <Select
            placeholder="No Filter"
            onChange={(e) => setStatus((e.target.value as types.PrescriptionState) || undefined)}
            value={status}
          >
            <option value={types.PrescriptionState.Active}>Status Active</option>
            <option value={types.PrescriptionState.Depleted}>Status Depleted</option>
            <option value={types.PrescriptionState.Expired}>Status Expired</option>
          </Select>
        }
        fetchMoreData={async () => {
          if (refetch && !loading) {
            const { data } = await refetch({
              ...getPrescriptionsData,
              after: rows?.at(-1)?.id
            });
            if (data?.prescriptions.length === 0) {
              setFinished(true);
            }
            setRows(rows.concat(data?.prescriptions.map(renderRow)));
          }
        }}
      />
    </Page>
  );
};
