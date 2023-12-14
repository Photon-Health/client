import {
  Box,
  Text,
  Alert,
  AlertIcon,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useBreakpointValue,
  useBoolean
} from '@chakra-ui/react';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { usePhoton } from '@photonhealth/react';
import { useDebounce } from 'use-debounce';

import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments';
import { DosageCalc } from '../../../components/DosageCalc';
import { TemplateView } from '../../../components/TemplateView';
import { SplitLayout } from '../../../components/SplitLayout';
import { TemplateTable } from '../components/templates/TemplateTable';
import { TemplateForm } from '../components/templates/TemplateForm';
import { TemplateActions } from '../components/templates/TemplateActions';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';

const renderTemplateRow = (
  rx: any,
  setSingleView: any,
  catalogId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setTemplateToEdit: any,
  setShowModal: any
) => {
  const med = rx.treatment;
  const templateName = rx.name ? (
    <>
      <Text as="b" fontSize="md">
        {rx.name}:
      </Text>{' '}
      {med.name}
    </>
  ) : (
    med.name
  );
  return {
    template: (
      <>
        <Text fontSize="md">{templateName}</Text>
        <Box ps={4}>
          <Text fontSize="sm" textOverflow="ellipsis" overflow="hidden" color="gray.500">
            QTY: {rx.dispenseQuantity} {rx.dispenseUnit}&nbsp;|&nbsp;Days Supply:&nbsp;
            {rx.daysSupply}
            {/* We need a -1 here becuause we are intentionally displaying Refills, not fills in the template UI */}
            &nbsp;|&nbsp;Refills: {rx.fillsAllowed - 1}&nbsp;|&nbsp;Sig: {rx.instructions}
          </Text>
        </Box>
      </>
    ),
    actions: (
      <TemplateActions
        template={rx}
        setSingleView={setSingleView}
        catalogId={catalogId}
        setLoading={setLoading}
        setShowModal={setShowModal}
        setTemplateToEdit={setTemplateToEdit}
      />
    )
  };
};

const organizationTemplateTabFragment = graphql(/* GraphQL */ `
  fragment OrganizationTemplateTabFragment on Organization {
    id
    name
  }
`);

export const TemplateTab = ({
  organizationFragment
}: {
  organizationFragment?: FragmentType<typeof organizationTemplateTabFragment>;
}) => {
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });

  const organization = useFragment(organizationTemplateTabFragment, organizationFragment);
  const { getCatalog, getCatalogs, updatePrescriptionTemplate, createPrescriptionTemplate }: any =
    usePhoton();
  const catalogs = getCatalogs();
  const catalog = getCatalog({
    id: catalogs.catalogs[0]?.id || '',
    fragment: { CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS },
    defer: true
  });
  const [catalogId, setCatalogId] = useState('');

  const [createRxTemplateMutation, { loading: loadingCreate, error: createError }] =
    createPrescriptionTemplate({
      refetchQueries: ['getCatalog'],
      awaitRefetchQueries: true,
      refetchArgs: {
        id: catalogId,
        fragment: {
          CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
        }
      }
    });
  const [updatePrescriptionTemplateMutation, { loading: loadingUpdate, error: updateError }] =
    updatePrescriptionTemplate({
      refetchQueries: ['getCatalog'],
      awaitRefetchQueries: true,
      refetchArgs: {
        id: catalogId,
        fragment: {
          CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
        }
      }
    });

  const [rows, setRows] = useState<any[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 250);
  const [singleView, setSingleView] = useState<any>(undefined);
  const [pages, setPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [childLoading, setChildLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useBoolean();
  const [templateToEdit, setTemplateToEdit] = useState(undefined);
  const pageSize = 10;

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
    if (!catalog.loading && catalog.catalog) {
      const sorted = [...catalog.catalog.templates].sort((a: any, b: any) =>
        a.treatment.name.toLowerCase() > b.treatment.name.toLowerCase() ? 1 : -1
      );
      const preppedRows = sorted;
      setRows(preppedRows);
      setPages(Math.ceil(preppedRows.length / pageSize));
      setCurrentPage(1);
      setFilteredRows(
        preppedRows.map((y: any) =>
          renderTemplateRow(
            y,
            setSingleView,
            catalogs.catalogs[0].id,
            setChildLoading,
            setTemplateToEdit,
            setShowModal
          )
        )
      );
    }
  }, [catalog.loading]);

  useEffect(() => {
    if (debouncedFilterText.length === 0) {
      const fRows = rows.map((y) =>
        renderTemplateRow(
          y,
          setSingleView,
          catalogs.catalogs[0].id,
          setChildLoading,
          setTemplateToEdit,
          setShowModal
        )
      );
      setFilteredRows(fRows);
      setCurrentPage(1);
      setPages(Math.ceil(fRows.length / pageSize));
    } else {
      const fRows = rows
        .filter((x) => x.treatment.name.toLowerCase().includes(debouncedFilterText.toLowerCase()))
        .map((y) =>
          renderTemplateRow(
            y,
            setSingleView,
            catalogs.catalogs[0].id,
            setChildLoading,
            setTemplateToEdit,
            setShowModal
          )
        );
      setCurrentPage(1);
      setPages(Math.ceil(fRows.length / pageSize));
      setFilteredRows(fRows);
    }
  }, [debouncedFilterText]);

  const [doseCalcVis, setDoseCalcVis] = useState(false);
  const quantityRef = useRef<HTMLInputElement>(null);
  const medicationSelectRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);

  const isLoading =
    catalogs.loading || catalog.loading || loadingCreate || loadingUpdate || childLoading;

  return (
    <>
      <Modal
        isOpen={singleView !== undefined}
        onClose={() => {
          setSingleView(undefined);
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>{singleView ? <TemplateView template={singleView} /> : null}</ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={showModal} onClose={setShowModal.off} size="lg" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={8}>
            <TemplateForm
              edit={!!templateToEdit}
              catalogs={catalogs}
              loading={loadingCreate || loadingUpdate}
              createRxTemplateMutation={createRxTemplateMutation}
              updatePrescriptionTemplateMutation={updatePrescriptionTemplateMutation}
              unitRef={unitRef}
              quantityRef={quantityRef}
              medicationSelectRef={medicationSelectRef}
              setDoseCalcVis={setDoseCalcVis}
              isModal
              onClose={setShowModal.off}
              templateToEdit={templateToEdit}
              setTemplateToEdit={setTemplateToEdit}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <DosageCalc
        isOpen={doseCalcVis}
        onClose={() => setDoseCalcVis(false)}
        quantityRef={quantityRef}
        drugRef={medicationSelectRef}
        unitRef={unitRef}
      />
      <VStack>
        <Text width="full" fontWeight="medium" fontSize="lg">
          Manage {organization ? `${organization.name}'s` : ''} Templates
        </Text>
        {createError ? (
          <Alert status="error">
            <AlertIcon />
            {createError.message}
          </Alert>
        ) : null}
        {updateError ? (
          <Alert status="error">
            <AlertIcon />
            {updateError.message}
          </Alert>
        ) : null}
        <SplitLayout>
          <TemplateTable
            isLoading={isLoading}
            rows={rows}
            filteredRows={filteredRows}
            pages={pages}
            pageSize={pageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filterText={filterText}
            setFilterText={setFilterText}
            setShowModal={setShowModal}
          />
          {!isMobileAndTablet ? (
            <TemplateForm
              edit={!!templateToEdit}
              templateToEdit={templateToEdit}
              setTemplateToEdit={setTemplateToEdit}
              catalogs={catalogs}
              loading={loadingCreate || loadingUpdate}
              createRxTemplateMutation={createRxTemplateMutation}
              updatePrescriptionTemplateMutation={updatePrescriptionTemplateMutation}
              unitRef={unitRef}
              quantityRef={quantityRef}
              medicationSelectRef={medicationSelectRef}
              setDoseCalcVis={setDoseCalcVis}
              onClose={() => {}}
            />
          ) : null}
        </SplitLayout>
      </VStack>
    </>
  );
};
