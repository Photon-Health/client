import {
  Badge,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Select,
  Show,
  Text,
  VStack,
  useBoolean
} from '@chakra-ui/react';

import { usePhoton } from 'packages/react';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useDebounce } from 'use-debounce';

import { PrescriptionTemplate } from 'packages/sdk/dist/types';
import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments';
import { DosageCalc } from '../../../components/DosageCalc';
import { TemplateView } from '../../../components/TemplateView';
import { TemplateActions } from '../components/templates/TemplateActions';
import { TemplateForm } from '../components/templates/TemplateForm';
import { TemplateTable } from '../components/templates/TemplateTable';

const renderTemplateRow = (
  rx: PrescriptionTemplate,
  setSingleView: (t?: PrescriptionTemplate) => void,
  catalogId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setTemplateToEdit: (t?: PrescriptionTemplate) => void,
  setShowModal: {
    on: () => void;
    off: () => void;
    toggle: () => void;
  }
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

  const fillsAllowed = rx.fillsAllowed ?? 1;

  return {
    template: (
      <>
        <Text fontSize="md">{templateName}</Text>
        <Box py={{ base: '2', md: 0 }}>
          <Text fontSize="sm" textOverflow="ellipsis" overflow="hidden" color="gray.500">
            QTY: {rx.dispenseQuantity} {rx.dispenseUnit}&nbsp;|&nbsp;Days Supply:&nbsp;
            {rx.daysSupply}
            {/* We need a -1 here becuause we are intentionally displaying Refills, not fills in the template UI */}
            &nbsp;|&nbsp;Refills: {fillsAllowed - 1}&nbsp;|&nbsp;Sig: {rx.instructions}
          </Text>
        </Box>
        <Show below="md">
          <Badge colorScheme={rx.isPrivate ? 'blue' : 'purple'}>
            {rx.isPrivate ? 'Personal' : 'Organization'}
          </Badge>
        </Show>
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
    ),
    badge: (
      <Badge colorScheme={rx.isPrivate ? 'blue' : 'purple'}>
        {rx.isPrivate ? 'Personal' : 'Organization'}
      </Badge>
    )
  };
};

type FilterTypes = 'ALL' | 'GLOBAL' | 'INDIVIDUAL';

export const TemplateTab = () => {
  const { getCatalog, getCatalogs } = usePhoton();
  const catalogs = getCatalogs();
  const catalog = getCatalog({
    id: catalogs.catalogs[0]?.id || '',
    fragment: { CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS },
    defer: true
  });
  const [catalogId, setCatalogId] = useState<string>();

  const [filterType, setFilterType] = useState<FilterTypes>('ALL');

  const [rows, setRows] = useState<PrescriptionTemplate[]>([]);
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 250);
  const [singleView, setSingleView] = useState<PrescriptionTemplate | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [childLoading, setChildLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useBoolean();
  const [templateToEdit, setTemplateToEdit] = useState<PrescriptionTemplate | undefined>(undefined);
  const pageSize = 10;

  useEffect(() => {
    if (!catalogs.loading && catalogs.catalogs.length > 0 && catalogs.catalogs[0]?.id) {
      setCatalogId(catalogs.catalogs[0]?.id);
      catalog.query!({
        id: catalogs.catalogs[0]?.id,
        fragment: {
          CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
        }
      });
    }
  }, [catalogs.loading, catalogs.catalogs.length, catalogs.catalogs[0]?.id]);

  useEffect(() => {
    if (!catalog.loading && catalog.catalog) {
      const preppedRows = catalog.catalog.templates
        .filter((x): x is PrescriptionTemplate => !!x)
        .sort((a, b) => (a.treatment.name.toLowerCase() > b.treatment.name.toLowerCase() ? 1 : -1));
      setRows(preppedRows);
      setCurrentPage(1);
    }
  }, [catalog.loading, catalogId, catalog.catalog?.templates]);

  useEffect(() => {
    // Reset current page to first page on debounce
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedFilterText]);

  const templateRowRender = useCallback(
    (template: PrescriptionTemplate) =>
      renderTemplateRow(
        template,
        setSingleView,
        catalogId ?? '',
        setChildLoading,
        setTemplateToEdit,
        setShowModal
      ),
    [setSingleView, catalogId, setChildLoading, setTemplateToEdit, setShowModal]
  );

  const typeFilter = useCallback(
    (template: PrescriptionTemplate) =>
      filterType === 'ALL' ||
      (filterType === 'GLOBAL' && !template.isPrivate) ||
      (filterType === 'INDIVIDUAL' && template.isPrivate),
    [filterType]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (x) =>
          (x.treatment.name.toLowerCase().includes(debouncedFilterText.toLowerCase()) ||
            x.name?.toLowerCase().includes(debouncedFilterText.toLowerCase())) &&
          typeFilter(x)
      ),
    [debouncedFilterText, rows, pageSize, typeFilter]
  );

  const formattedRows = useMemo(() => {
    return {
      rows: filteredRows.map(templateRowRender),
      pages: Math.ceil(filteredRows.length / pageSize)
    };
  }, [filteredRows]);

  const [doseCalcVis, setDoseCalcVis] = useState(false);
  const quantityRef = useRef<HTMLInputElement>(null);
  const medicationSelectRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);

  const onClearSelectedTemplate = useCallback(() => setTemplateToEdit(undefined), []);

  const isLoading = catalogs.loading || (catalog.loading && !catalog.catalog) || childLoading;

  const onFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    // Change event triggered even if no change
    if (e.target.value !== filterType) {
      setCurrentPage(1);
      setFilterType(e.target.value as FilterTypes);
    }
  }, []);

  if (catalogs.loading || !catalogId) {
    return null;
  }

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
      <TemplateForm
        isOpen={showModal}
        catalogId={catalogId}
        clearSelectedTemplate={onClearSelectedTemplate}
        edit={!!templateToEdit}
        unitRef={unitRef}
        quantityRef={quantityRef}
        medicationSelectRef={medicationSelectRef}
        setDoseCalcVis={setDoseCalcVis}
        loading={isLoading}
        onClose={setShowModal.off}
        templateToEdit={templateToEdit}
      />
      <DosageCalc
        isOpen={doseCalcVis}
        onClose={() => setDoseCalcVis(false)}
        quantityRef={quantityRef}
        drugRef={medicationSelectRef}
        unitRef={unitRef}
      />
      <VStack w="full">
        <TemplateTable
          isLoading={isLoading}
          rows={filteredRows}
          filteredRows={formattedRows.rows}
          pages={formattedRows.pages}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          filterText={filterText}
          setFilterText={setFilterText}
          setShowModal={setShowModal}
          filterElement={
            <Select onChange={onFilterChange} value={filterType}>
              <option value="ALL">All Templates</option>
              <option value="GLOBAL">Organization Templates</option>
              <option value="INDIVIDUAL">Personal Templates</option>
            </Select>
          }
        />
      </VStack>
    </>
  );
};
