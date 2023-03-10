import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import {
  Badge,
  HStack,
  IconButton,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text
} from '@chakra-ui/react';
import { FiInfo, FiShoppingCart } from 'react-icons/fi';

import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePhoton } from '@photonhealth/react';
import { formatDate } from '../../utils';

import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import NameView from '../components/NameView';
import PatientView from '../components/PatientView';

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
}

const ActionsView = (props: ActionsViewProps) => {
  const { prescriptionId, patientId } = props;
  return (
    <HStack spacing="0">
      <IconButton
        icon={<FiInfo fontSize="1.25rem" />}
        variant="ghost"
        aria-label="View prescription details"
        as={RouterLink}
        to={`/prescriptions/${prescriptionId}`}
      />
      <IconButton
        icon={<FiShoppingCart fontSize="1.25rem" />}
        variant="ghost"
        aria-label="New Order"
        as={RouterLink}
        to={`/orders/new?patientId=${patientId}&prescriptionIds=${prescriptionId}`}
      />
    </HStack>
  );
};

export const PRESCRIPTION_COLOR_MAP: object = {
  READY: 'green', // TODO: delete
  PROCESSING: 'yellow', // TODO: delete
  ACTIVE: 'green',
  DEPLETED: 'red',
  EXPIRED: 'red',
  CANCELED: 'gray',
  ERROR: 'red'
};

export const PRESCRIPTION_STATE_MAP: object = {
  READY: 'Active', // TODO: delete
  PROCESSING: 'Active', // TODO: delete
  ACTIVE: 'Active',
  DEPLETED: 'Depleted',
  EXPIRED: 'Expired',
  CANCELED: 'Canceled',
  ERROR: 'Error'
};

const renderRow = (rx: any) => {
  const { id, patient } = rx;
  const med = rx.treatment;
  const extId = rx.externalId || <Text as="i">None</Text>;
  const prescriber = rx.prescriber.name.full;
  const writtenAt = formatDate(rx.writtenAt);

  const state = PRESCRIPTION_STATE_MAP[rx.state as keyof object] || '';
  const stateColor = PRESCRIPTION_COLOR_MAP[rx.state as keyof object] || '';

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
      <Badge size="sm" colorScheme={stateColor}>
        {state}
      </Badge>
    ),
    prescriber: <NameView name={prescriber} />,
    writtenAt: <Text>{writtenAt}</Text>,
    actions: <ActionsView prescriptionId={id} patientId={rx.patient.id} />
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

export const Prescriptions = () => {
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

  const { prescriptions, loading, error, refetch } = getPrescriptions({
    patientId,
    prescriberId,
    patientName: filterTextDebounce.length > 0 ? filterTextDebounce : null
  });

  useEffect(() => {
    if (!loading) {
      const preppedRows = prescriptions.filter((row) => row).map(renderRow);
      setRows(preppedRows);
      setFinished(prescriptions.length === 0);
    }
  }, [loading]);

  const skeletonRows = new Array(25).fill(0).map(renderSkeletonRow);

  return (
    <Page header="Prescriptions">
      <TablePage
        data={loading ? skeletonRows : rows}
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
        fetchMoreData={async () => {
          const { data } = await refetch({
            patientId: patientId || undefined,
            prescriberId: prescriberId || undefined,
            patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
            after: rows?.at(-1)?.id
          });
          if (data?.prescriptions.length === 0) {
            setFinished(true);
          }
          setRows(rows.concat(data?.prescriptions.map(renderRow)));
        }}
      />
    </Page>
  );
};
