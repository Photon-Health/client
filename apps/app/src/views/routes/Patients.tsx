import { Link as RouterLink } from 'react-router-dom';

import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonText,
  Text
} from '@chakra-ui/react';

import { FiEdit, FiEye, FiMoreVertical, FiShoppingCart } from 'react-icons/fi';
import { TbPrescription } from 'react-icons/tb';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useDebounce } from 'use-debounce';
import dobToAge from 'dob-to-age';
import { Page } from '../components/Page';
import { TablePage } from '../components/TablePage';
import PatientView from '../components/PatientView';
import ContactView from '../components/ContactView';
import { Patient } from 'packages/sdk/dist/types';

const GET_PATIENTS = gql`
  query GetPatients($name: String, $after: ID, $first: Int) {
    patients(after: $after, first: $first, filter: { name: $name }) {
      id
      externalId
      phone
      email
      sex
      dateOfBirth
      name {
        full
      }
    }
  }
`;

interface EditViewProps {
  id: string;
  setDisableScroll: Dispatch<SetStateAction<boolean>>;
}

const EditView = (props: EditViewProps) => {
  const { id, setDisableScroll } = props;

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
            as={RouterLink}
            to={`/patients/update/${id}`}
            onClick={() => {
              setDisableScroll(true);
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

  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [disableScroll, setDisableScroll] = useState<boolean>(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);

  const getPatientsData = {
    first: 25,
    name: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
  };
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_PATIENTS, {
    variables: getPatientsData
  });
  const patients: Patient[] | undefined = data?.patients;

  useEffect(() => {
    if (filterTextDebounce) {
      refetch({
        name: filterTextDebounce
      });
    }
  }, [filterTextDebounce, refetch]);

  useEffect(() => {
    if (!loading && patients) {
      setRows(
        patients
          .filter((patient) => !!patient)
          .map((patient) => renderRow(patient, setDisableScroll))
      );
      setFinished(patients.length === 0);
    }
  }, [loading, patients]);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
          await fetchMore({
            variables: {
              ...getPatientsData,
              after: rows?.at(-1)?.id,
              name: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              if (fetchMoreResult.patients.length === 0) {
                setFinished(true);
              }
              return {
                ...prev,
                patients: [...prev.patients, ...fetchMoreResult.patients]
              };
            }
          });
        }}
      />
    </Page>
  );
};
