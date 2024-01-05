import {
  Text,
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  VStack,
  useBreakpointValue,
  useBoolean,
  useToast
} from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { usePhoton } from 'packages/react';
import { useDebounce } from 'use-debounce';
import { useMutation } from '@apollo/client';

import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments';
import { SplitLayout } from '../../../components/SplitLayout';
import { TreatmentTable } from '../components/treatments/TreatmentTable';
import { TreatmentForm } from '../components/treatments/TreatmentForm';
import { TreatmentActions } from '../components/treatments/TreatmentActions';
import { ADD_TO_CATALOG } from '../../../../mutations';
import { graphql } from 'apps/app/src/gql/gql';
import { FragmentType, useFragment } from 'apps/app/src/gql';

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
    fragment: { CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS },
    defer: true
  });
  const [catalogId, setCatalogId] = useState('');
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
        title: 'Treatment added',
        status: 'success'
      });

      // TODO replace catalog SDK query
      // also setting timeout for now to allow for the mutation to complete, will have a better solution when we replace the SDK query
      setTimeout(() => {
        catalog.query!({
          id: catalogs.catalogs[0].id,
          fragment: {
            CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
          }
        });
      }, 500);
    }
  });

  useEffect(() => {
    if (!catalogs.loading && catalogs.catalogs.length > 0) {
      setCatalogId(catalogs.catalogs[0].id);
      catalog.query!({
        id: catalogs.catalogs[0].id,
        fragment: {
          CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
        }
      });
    }
  }, [catalogs.loading]);

  useEffect(() => {
    if (!catalog.loading && catalog.catalog?.treatments) {
      const sorted = [...catalog.catalog.treatments].sort((a: any, b: any) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      );
      const preppedRows = sorted;
      setRows(preppedRows);
      if (debouncedFilterText.length === 0 && filterText.length === 0) {
        const fRows = preppedRows.map((y: any) =>
          renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id)
        );
        setFilteredRows(fRows);
        setPages(Math.ceil(fRows.length / pageSize));
        setCurrentPage(1);
      } else {
        const fRows = preppedRows
          .filter((x: any) =>
            x.name
              .toLowerCase()
              .includes(debouncedFilterText.toLowerCase() || filterText.toLowerCase())
          )
          .map((y: any) => renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id));
        setPages(Math.ceil(fRows.length / pageSize));
        setCurrentPage(1);
        setFilteredRows(fRows);
      }
    }
  }, [catalog.loading, catalog.catalog?.treatments?.length]);

  useEffect(() => {
    if (debouncedFilterText.length === 0 && filterText.length === 0) {
      const fRows = rows.map((y: any) =>
        renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id)
      );
      setPages(Math.ceil(fRows.length / pageSize));
      setCurrentPage(1);
      setFilteredRows(fRows);
    } else {
      const fRows = rows
        .filter((x) => x.name.toLowerCase().includes(debouncedFilterText.toLowerCase()))
        .map((y: any) => renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id));
      setPages(Math.ceil(fRows.length / pageSize));
      setCurrentPage(1);
      setFilteredRows(fRows);
    }
  }, [debouncedFilterText]);

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
