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
  useBoolean
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { usePhoton } from '@photonhealth/react'
import { useDebounce } from 'use-debounce'

import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments'
import { SplitLayout } from '../../../components/SplitLayout'
import { TreatmentTable } from '../components/TreatmentTable'
import { TreatmentForm } from '../components/TreatmentForm'
import { TreatmentActions } from '../components/TreatmentActions'

interface MedViewProps {
  name: string
}

const MedView = (props: MedViewProps) => {
  const { name } = props
  return <Text fontWeight="medium">{name}</Text>
}

const renderTreatmentRow = (
  med: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  treatmentId: string,
  catalogId: string
) => {
  const { id } = med

  return {
    id,
    treatment: <MedView name={med.name} />,
    actions: (
      <TreatmentActions setLoading={setLoading} treatmentId={treatmentId} catalogId={catalogId} />
    )
  }
}

export const TreatmentTab = (props: any) => {
  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false })
  const { organization } = props
  const { getCatalog, getCatalogs, addToCatalog } = usePhoton()
  const catalogs = getCatalogs()
  const catalog = getCatalog({
    id: catalogs.catalogs[0]?.id || '',
    fragment: { CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS },
    defer: true
  })
  const [catalogId, setCatalogId] = useState('')

  const [addToCatalogMutation, { loading, error }] = addToCatalog({
    refetchQueries: ['getCatalog'],
    awaitRefetchQueries: true,
    refetchArgs: {
      id: catalogId,
      fragment: {
        CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
      }
    }
  })

  const submitRef: any = useRef()

  const [rows, setRows] = useState<any[]>([])
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [filterText, setFilterText] = useState('')
  const [debouncedFilterText] = useDebounce(filterText, 250)
  const [pages, setPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const advSearchRef: any = useRef()
  const pageSize = 10
  const [childLoading, setChildLoading] = useState(false)

  const [showModal, setShowModal] = useBoolean()

  useEffect(() => {
    if (!catalogs.loading && catalogs.catalogs.length > 0) {
      setCatalogId(catalogs.catalogs[0].id)
      catalog.query!({
        id: catalogs.catalogs[0].id,
        fragment: {
          CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
        }
      })
    }
  }, [catalogs.loading])

  useEffect(() => {
    if (!catalog.loading && catalog.catalog?.treatments) {
      const sorted = [...catalog.catalog.treatments].sort((a: any, b: any) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      )
      const preppedRows = sorted
      setRows(preppedRows)
      if (debouncedFilterText.length === 0 && filterText.length === 0) {
        const fRows = preppedRows.map((y: any) =>
          renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id)
        )
        setFilteredRows(fRows)
        setPages(Math.ceil(fRows.length / pageSize))
        setCurrentPage(1)
      } else {
        const fRows = preppedRows
          .filter((x: any) =>
            x.name
              .toLowerCase()
              .includes(debouncedFilterText.toLowerCase() || filterText.toLowerCase())
          )
          .map((y: any) => renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id))
        setPages(Math.ceil(fRows.length / pageSize))
        setCurrentPage(1)
        setFilteredRows(fRows)
      }
    }
  }, [catalog.loading, catalog.catalog?.treatments?.length])

  useEffect(() => {
    if (debouncedFilterText.length === 0 && filterText.length === 0) {
      const fRows = rows.map((y: any) =>
        renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id)
      )
      setPages(Math.ceil(fRows.length / pageSize))
      setCurrentPage(1)
      setFilteredRows(fRows)
    } else {
      const fRows = rows
        .filter((x) => x.name.toLowerCase().includes(debouncedFilterText.toLowerCase()))
        .map((y: any) => renderTreatmentRow(y, setChildLoading, y.id, catalogs.catalogs[0].id))
      setPages(Math.ceil(fRows.length / pageSize))
      setCurrentPage(1)
      setFilteredRows(fRows)
    }
  }, [debouncedFilterText])

  const isLoading = catalogs.loading || catalog.loading || loading || childLoading

  return (
    <VStack>
      <Modal isOpen={showModal} onClose={setShowModal.off} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>
            <TreatmentForm
              loading={loading}
              catalogId={catalogId}
              addToCatalogMutation={addToCatalogMutation}
              submitRef={submitRef}
              advSearchRef={advSearchRef}
              isModal
              onClose={setShowModal.off}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Text width="full" fontWeight="medium" fontSize="lg">
        Manage {organization.organization ? `${organization.organization.name}'s` : ''} Catalog
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
            loading={loading}
            catalogId={catalogId}
            addToCatalogMutation={addToCatalogMutation}
            submitRef={submitRef}
            advSearchRef={advSearchRef}
            onClose={() => {}}
          />
        ) : null}
      </SplitLayout>
    </VStack>
  )
}
