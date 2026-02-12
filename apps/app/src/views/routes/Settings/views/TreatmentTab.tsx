import { useMutation } from '@apollo/client';
import {
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
  useBoolean,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { FragmentType, useFragment } from 'apps/app/src/gql';
import { graphql } from 'apps/app/src/gql/gql';
import { CatalogTreatmentFieldsMap } from '../../../../model/fragments';
import { ADD_TO_CATALOG } from '../../../../mutations';
import { SplitLayout } from '../../../components/SplitLayout';
import { StyledToast } from '../../../components/StyledToast';
import { TreatmentActions } from '../components/treatments/TreatmentActions';
import { AddTreatmentToCatalogForm } from '../components/treatments/AddTreatmentToCatalogForm';
import { TreatmentTable } from '../components/treatments/TreatmentTable';
import { sortBy } from 'lodash';

interface MedViewProps {
  name: string;
}

const MedView = (props: MedViewProps) => {
  const { name } = props;
  return <Text fontWeight="medium">{name}</Text>;
};

const renderTreatmentRow = (
  med: any,
  setLoading: Dispatch<SetStateAction<boolean>>,
  treatmentId: string,
  catalogId: string
) => {
  const { id } = med;

  return {
    id,
    treatment: <MedView name={med.name} />,
    actions: (
      <TreatmentActions setLoading={setLoading} treatmentId={treatmentId} catalogId={catalogId} />
    )
  };
};

const organizationTreatmentTabFragment = graphql(/* GraphQL */ `
  fragment OrganizationTreatmentTabFragment on Organization {
    id
    name
  }
`);

export const TreatmentTab = ({
  organization: organizationFragment
}: {
  organization?: FragmentType<typeof organizationTreatmentTabFragment>;
}) => {
  const toast = useToast();
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });
  const organization = useFragment(organizationTreatmentTabFragment, organizationFragment);
  const { getCatalog, getCatalogs } = usePhoton();
  const catalogs = getCatalogs();
  const catalog = getCatalog({
    id: catalogs.catalogs[0]?.id || '',
    fragment: CatalogTreatmentFieldsMap,
    defer: true
  });
  const [catalogId, setCatalogId] = useState('');
  const [showModal, setShowModal] = useBoolean();
  // use this to reset the form after adding a treatment
  const [resetKey, setResetKey] = useState(0);

  const submitRef: any = useRef();

  const [rows, setRows] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 250);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [childLoading, setChildLoading] = useState(false);
  const pageSize = 10;

  const [addToCatalog, { loading, error }] = useMutation(ADD_TO_CATALOG, {
    onCompleted: () => {
      setShowModal.off();
      setResetKey(resetKey + 1);
      toast({
        position: 'top-right',
        duration: 4000,
        render: ({ onClose }) => (
          <StyledToast onClose={onClose} type="success" description="Treatment added" />
        )
      });

      // TODO replace catalog SDK query
      // also setting timeout for now to allow for the mutation to complete, will have a better solution when we replace the SDK query
      setTimeout(() => {
        catalog.query!({
          id: catalogs.catalogs[0].id,
          fragment: CatalogTreatmentFieldsMap
        });
      }, 500);
    }
  });

  useEffect(() => {
    if (!catalogs.loading && catalogs.catalogs.length > 0) {
      setCatalogId(catalogs.catalogs[0].id);
      catalog.query!({
        id: catalogs.catalogs[0].id,
        fragment: CatalogTreatmentFieldsMap
      });
    }
  }, [catalogs.loading]);

  useEffect(() => {
    if (!catalog.loading && catalog.catalog?.treatments) {
      const preppedRows = sortBy(catalog.catalog.treatments, 'name');
      setRows(preppedRows);
      setCurrentPage(1);
    }
  }, [catalog.loading, catalog.catalog?.treatments]);

  useEffect(() => {
    // Reset current page to first page on debounce
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedFilterText]);

  const formattedRows = useMemo(() => {
    const result = rows
      .filter((x) => x.name.toLowerCase().includes(debouncedFilterText.toLowerCase()))
      .map((y: any) => renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id));

    return {
      rows: result,
      pages: Math.ceil(result.length / pageSize)
    };
  }, [debouncedFilterText, rows, pageSize, catalogs.catalogs[0]?.id]);

  const isLoading = catalogs.loading || catalog.loading || loading || childLoading;

  return (
    <VStack>
      <Modal isOpen={showModal} onClose={setShowModal.off} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>
            <AddTreatmentToCatalogForm
              key={resetKey}
              loading={loading}
              catalogId={catalogId}
              addToCatalog={addToCatalog}
              onClose={setShowModal.off}
              isModal
              submitRef={submitRef}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Text width="full" fontWeight="medium" fontSize="lg">
        Manage {organization ? `${organization.name}'s ` : ''}Catalog
      </Text>
      {error && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
      <SplitLayout>
        <TreatmentTable
          rows={formattedRows.rows}
          setCurrentPage={setCurrentPage}
          loading={isLoading}
          filterText={filterText}
          setFilterText={setFilterText}
          currentPage={currentPage}
          pages={formattedRows.pages}
          pageSize={pageSize}
          setShowModal={setShowModal}
          hasSearch={!!filterText}
        />
        {!isMobileAndTablet ? (
          <AddTreatmentToCatalogForm
            key={resetKey}
            loading={loading}
            catalogId={catalogId}
            addToCatalog={addToCatalog}
            submitRef={submitRef}
            onClose={() => {}}
          />
        ) : null}
      </SplitLayout>
    </VStack>
  );
};
