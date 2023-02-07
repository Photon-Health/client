import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';

import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text
} from '@chakra-ui/react';

import { FiEdit, FiEye, FiMoreVertical, FiShoppingCart } from 'react-icons/fi';
import { TbPrescription } from 'react-icons/tb';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePhoton } from '@photonhealth/react';
import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import PatientView from '../components/PatientView';
import ContactView from '../components/ContactView';

const dobToAge = require('dob-to-age');

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-update-patient-dialog': unknown;
    }
  }
}
interface EditViewProps {
  id: string;
  setDisableScroll: Dispatch<SetStateAction<boolean>>;
}

const EditView = (props: EditViewProps) => {
  const { id, setDisableScroll } = props;
  const navigate = useNavigate();
  return (
    <HStack justifyContent="flex-end">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical fontSize="1.25rem" />}
          variant="ghost"
        />
        <MenuList>
          <MenuItem icon={<FiEye fontSize="1.2em" />} as={RouterLink} to={`/patients/${id}`}>
            View Patient
          </MenuItem>
          <MenuItem
            icon={<FiEdit fontSize="1.2em" />}
            onClick={() => {
              setDisableScroll(true);
              navigate(`/patients/update/${id}`);
            }}
          >
            Edit Patient
          </MenuItem>
          <MenuItem
            icon={<TbPrescription fontSize="1.2em" />}
            as={RouterLink}
            to={`/prescriptions/new?patientId=${id}`}
          >
            New Prescription
          </MenuItem>
          <MenuItem
            icon={<FiShoppingCart fontSize="1.2em" />}
            as={RouterLink}
            to={`/orders/new?patientId=${id}`}
          >
            New Order
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};

const renderRow = (patient: any, setDisableScroll: Dispatch<SetStateAction<boolean>>) => {
  const { id } = patient;
  const extId = patient.externalId || <Text as="i">None</Text>;

  return {
    id,
    externalId: extId,
    name: <PatientView patient={patient} />,
    age: dobToAge(patient.dateOfBirth),
    contact: <ContactView phone={patient.phone} email={patient.email} />,
    edit: <EditView id={id} setDisableScroll={setDisableScroll} />
  };
};

const renderSkeletonRow = () => ({
  name: (
    <HStack alignContent="center">
      <SkeletonCircle size="10" />
      <SkeletonText noOfLines={2} width="200px" />
    </HStack>
  ),
  age: <SkeletonText noOfLines={1} width="25px" />,
  contact: <SkeletonText noOfLines={2} width="150px" />,
  externalId: <SkeletonText noOfLines={1} width="100px" />,
  edit: (
    <HStack spacing={5} justifyContent="flex-end" me={2}>
      <Skeleton height="20px" width="20px" />
    </HStack>
  )
});

export const Patients = () => {
  const [params] = useSearchParams();
  const reload = params.get('reload');

  const columns = [
    {
      Header: 'Name',
      accessor: 'name' // accessor is the "key" in the data
    },
    {
      Header: 'Age',
      accessor: 'age'
    },
    {
      Header: 'Contact',
      accessor: 'contact'
    },
    {
      Header: 'Ext. Id',
      accessor: 'externalId'
    },
    {
      Header: '',
      accessor: 'edit'
    }
  ];

  const { getPatients, getPatient } = usePhoton();
  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [disableScroll, setDisableScroll] = useState<boolean>(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const { patients, loading, error, refetch } = getPatients({
    name: filterTextDebounce.length > 0 ? filterTextDebounce : null
  });

  const { refetch: refetchPatient } = getPatient({
    id: ''
  });

  useEffect(() => {
    if (reload) {
      const getData = async () => {
        const patientId = reload.split('-')[0];
        const { data } = await refetchPatient({
          id: patientId
        });
        setRows(
          rows.map((x) => {
            if (x.id === patientId) {
              return renderRow(data.patient, setDisableScroll);
            }
            return x;
          })
        );
      };
      getData();
    }
  }, [reload]);

  useEffect(() => {
    if (!loading) {
      setRows(patients.map((x) => renderRow(x, setDisableScroll)));
      setFinished(patients.length === 0);
    }
  }, [loading]);

  const skeletonRows = new Array(25).fill(0).map(renderSkeletonRow);

  return (
    <Page header="Patients" disableScroll={disableScroll}>
      <TablePage
        data={loading ? skeletonRows : rows}
        columns={columns}
        loading={loading}
        error={error}
        ctaText="New Patient"
        ctaColor="blue"
        ctaRoute="/patients/new"
        filterText={filterText}
        setFilterText={setFilterText}
        searchPlaceholder="Search by patient name"
        hasMore={rows.length % 25 === 0 && !finished}
        fetchMoreData={async () => {
          const { data } = await refetch({
            name: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
            after: rows?.at(-1)?.id
          });
          if (data?.patients.length === 0) {
            setFinished(true);
          }
          setRows(rows.concat(data?.patients.map((x) => renderRow(x, setDisableScroll))));
        }}
      />
    </Page>
  );
};
