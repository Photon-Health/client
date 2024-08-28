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
import { Dispatch, SetStateAction, useEffect, useRef, useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { FragmentType, useFragment } from 'apps/app/src/gql';
import { graphql } from 'apps/app/src/gql/gql';
import { CatalogTreatmentFieldsMap } from '../../../../model/fragments';
import { ADD_TO_CATALOG } from '../../../../mutations';
import { SplitLayout } from '../../../components/SplitLayout';
import { StyledToast } from '../../../components/StyledToast';
import { TreatmentActions } from '../components/treatments/TreatmentActions';
import { TreatmentForm } from '../components/treatments/TreatmentForm';
import { TreatmentTable } from '../components/treatments/TreatmentTable';
import { Treatment } from 'packages/sdk/src/types';

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

export const CatalogTab = ({
  organization: organizationFragment
}: {
  organization?: FragmentType<typeof organizationTreatmentTabFragment>;
}) => {
  const toast = useToast();
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });
  const organization = useFragment(organizationTreatmentTabFragment, organizationFragment);
  const { getCatalog, getCatalogs } = usePhoton();
  const catalogs = getCatalogs();
  const catalogId = useMemo(() => catalogs.catalogs?.[0]?.id ?? '', [catalogs.catalogs]);

  const catalog = getCatalog({
    id: catalogId,
    fragment: CatalogTreatmentFieldsMap,
    defer: true
  });
  const [showModal, setShowModal] = useBoolean();
  // use this to reset the form after adding a treatment
  const [resetKey, setResetKey] = useState(0);

  const submitRef: any = useRef();

  const [rows, setRows] = useState<any[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 250);
  const [pages, setPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [childLoading, setChildLoading] = useState(false);

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
        catalog.query({
          id: catalogId,
          fragment: CatalogTreatmentFieldsMap
        });
      }, 500);
    }
  });

  // Load catalog once the catalogs have been loaded
  useEffect(() => {
    if (!catalog.loading && catalogId && catalog.catalog == null) {
      catalog.query({
        id: catalogId,
        fragment: CatalogTreatmentFieldsMap
      });
    }
  }, [catalog, catalogId, catalog.loading]);

  useEffect(() => {
    if (!catalog.loading && catalog.catalog?.treatments) {
      const sorted = [...catalog.catalog.treatments]
        .filter<Treatment>((t): t is Treatment => t != null)
        .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
      const preppedRows = sorted;
      setRows(preppedRows);
      if (debouncedFilterText.length === 0 && filterText.length === 0) {
        const fRows = preppedRows.map((y) =>
          renderTreatmentRow(y, setChildLoading, y.id, catalogId)
        );
        setFilteredRows(fRows);
        setPages(Math.ceil(fRows.length / pageSize));
        setCurrentPage(1);
      } else {
        const fRows = preppedRows
          .filter((x) =>
            x.name
              .toLowerCase()
              .includes(debouncedFilterText.toLowerCase() || filterText.toLowerCase())
          )
          .map((y) => renderTreatmentRow(y, setChildLoading, y.id, catalogId));
        setPages(Math.ceil(fRows.length / pageSize));
        setCurrentPage(1);
        setFilteredRows(fRows);
      }
    }
  }, [catalog.catalog?.treatments, catalog.loading, catalogId, debouncedFilterText, filterText]);

  useEffect(() => {
    if (debouncedFilterText.length === 0 && filterText.length === 0) {
      const fRows = rows.map((y) => renderTreatmentRow(y, setChildLoading, y.id, catalogId));
      setPages(Math.ceil(fRows.length / pageSize));
      setCurrentPage(1);
      setFilteredRows(fRows);
    } else {
      const fRows = rows
        .filter((x) => x.name.toLowerCase().includes(debouncedFilterText.toLowerCase()))
        .map((y) => renderTreatmentRow(y, setChildLoading, y.id, catalogId));
      setPages(Math.ceil(fRows.length / pageSize));
      setCurrentPage(1);
      setFilteredRows(fRows);
    }
  }, [catalogId, debouncedFilterText, filterText.length, rows]);

  const isLoading = catalogs.loading || catalog.loading || loading || childLoading;

  return (
    <VStack>
      <Modal isOpen={showModal} onClose={setShowModal.off} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>
            <TreatmentForm
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
          rows={rows}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
          filteredRows={filteredRows}
          filterText={filterText}
          setFilterText={setFilterText}
          currentPage={currentPage}
          pages={pages}
          pageSize={pageSize}
          setShowModal={setShowModal}
        />
        {!isMobileAndTablet ? (
          <TreatmentForm
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
