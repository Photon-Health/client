import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import {
  Badge,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SkeletonCircle,
  SkeletonText,
  Text,
  useBreakpointValue
} from '@chakra-ui/react'

import { FiInfo } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { usePhoton } from '@photonhealth/react'
import { Page } from '../components/Page'
import { TablePage } from '../components/TablePage'
import PatientView from '../components/PatientView'
import PharmacyNameView from '../components/PharmacyNameView'
import { formatDate } from '../../utils'

export const ORDER_FULFILLMENT_STATE_MAP: object = {
  SENT: 'Sent',
  // Pick Up
  RECEIVED: 'Received',
  READY: 'Ready',
  PICKED_UP: 'Picked up',
  // Mail Order
  FILLING: 'Filling',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
}

export const ORDER_FULFILLMENT_COLOR_MAP: object = {
  SENT: 'yellow',
  // Pick Up
  RECEIVED: 'orange',
  READY: 'green',
  PICKED_UP: 'gray',
  // Mail Order
  FILLING: 'orange',
  SHIPPED: 'green',
  DELIVERED: 'gray'
}

interface ActionsProps {
  id: string
}

const Actions = (props: ActionsProps) => {
  const { id } = props
  return (
    <HStack spacing="0">
      <IconButton
        icon={<FiInfo fontSize="1.25rem" />}
        variant="ghost"
        aria-label="View Order"
        title="View order details"
        as={RouterLink}
        to={`/orders/${id}`}
      />
    </HStack>
  )
}

const renderRow = (order: any) => {
  const { id, pharmacy, patient } = order
  const extId = order.externalId || <Text as="i">None</Text>

  const fills = order.fills.reduce((prev: string, cur: any) => {
    const fill = cur.treatment.name
    return prev ? `${prev}, ${fill}` : fill
  }, '')

  const pharmacyView = pharmacy?.name ? (
    <Popover>
      <PopoverTrigger>
        <HStack spacing={0}>
          <Text alignContent="center">{pharmacy.name}</Text>
          <IconButton
            variant="ghost"
            color="gray.500"
            aria-label="View pharmacy details"
            icon={<FiInfo />}
          />
        </HStack>
      </PopoverTrigger>
      <PopoverContent p={1}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody whiteSpace="pre-wrap">
          <PharmacyNameView
            name={pharmacy.name}
            phone={pharmacy.phone}
            address={pharmacy.address}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <Text as="i">Pending</Text>
  )

  let state
  let stateColor
  if (order.fulfillment?.state) {
    if (ORDER_FULFILLMENT_STATE_MAP[order.fulfillment.state as keyof object]) {
      state = ORDER_FULFILLMENT_STATE_MAP[order.fulfillment.state as keyof object]
      stateColor = ORDER_FULFILLMENT_COLOR_MAP[order.fulfillment.state as keyof object]
    } else {
      // If state is not handled in the list, format the name and use a default color
      const s = order.fulfillment.state
      state = s[0].toUpperCase() + s.slice(1).toLowerCase()
      stateColor = 'gray'
    }
  }

  return {
    id,
    externalId: extId,
    createdAt: formatDate(order.createdAt),
    fills: <Text fontWeight="medium">{fills}</Text>,
    fulfillmentStatus: order.fulfillment?.state ? (
      <Badge size="sm" colorScheme={stateColor}>
        {state}
      </Badge>
    ) : (
      <Text as="i">None</Text>
    ),
    patient: <PatientView patient={patient} />,
    pharmacy: pharmacyView,
    actions: <Actions id={id} />
  }
}

const renderSkeletonRow = (isMobile: boolean | undefined) =>
  isMobile
    ? {
        fills: <SkeletonText width="75px" noOfLines={4} spacing="3" />,
        patient: (
          <HStack alignContent="center">
            <SkeletonCircle size="10" />
            <SkeletonText noOfLines={2} width="150px" />
          </HStack>
        ),
        fulfillmentStatus: <SkeletonText noOfLines={1} />,
        pharmacy: <SkeletonText noOfLines={1} />,
        createdAt: <SkeletonText noOfLines={1} />,
        externalId: <SkeletonText noOfLines={1} width="50px" />,
        actions: <SkeletonCircle size="5" />
      }
    : {
        fills: <SkeletonText width="250px" noOfLines={1} spacing="3" />,
        patient: (
          <HStack alignContent="center">
            <SkeletonCircle size="10" />
            <SkeletonText noOfLines={2} width="150px" />
          </HStack>
        ),
        fulfillmentStatus: <SkeletonText noOfLines={1} />,
        pharmacy: <SkeletonText noOfLines={1} />,
        createdAt: <SkeletonText noOfLines={1} />,
        externalId: <SkeletonText noOfLines={1} width="50px" />,
        actions: <SkeletonCircle size="5" />
      }

export const Orders = () => {
  const [params] = useSearchParams()
  const patientId = params.get('patientId')

  const columns = [
    {
      Header: 'Medication',
      accessor: 'fills',
      width: 'wrap'
    },
    {
      Header: 'Patient',
      accessor: 'patient',
      width: 'wrap'
    },
    {
      Header: 'Fulfillment Status',
      accessor: 'fulfillmentStatus'
    },
    {
      Header: 'Pharmacy',
      accessor: 'pharmacy'
    },
    {
      Header: 'Date',
      accessor: 'createdAt'
    },
    {
      Header: 'Ext. Id',
      accessor: 'externalId'
    },
    {
      Header: '',
      accessor: 'actions'
    }
  ]

  const { getOrders } = usePhoton()
  const [filterText, setFilterText] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [finished, setFinished] = useState(false)
  const [filterTextDebounce] = useDebounce(filterText, 250)

  const isMobile = useBreakpointValue({ base: true, md: false })

  const { orders, loading, error, refetch } = getOrders({
    patientId,
    patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined
  })

  useEffect(() => {
    if (!loading) {
      setRows(orders.map(renderRow))
      setFinished(orders.length === 0)
    }
  }, [loading])

  const skeletonRows = new Array(25).fill(0).map(() => renderSkeletonRow(isMobile))

  return (
    <Page header="Orders">
      <TablePage
        data={loading ? skeletonRows : rows}
        columns={columns}
        loading={loading}
        error={error}
        ctaText="New Order"
        ctaColor="blue"
        ctaRoute="/orders/new"
        filterText={filterText}
        setFilterText={setFilterText}
        hasMore={rows.length % 25 === 0 && !finished}
        searchPlaceholder="Search by patient name"
        fetchMoreData={async () => {
          if (refetch) {
            const { data } = await refetch({
              patientId: patientId || undefined,
              patientName: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
              after: rows?.at(-1)?.id
            })
            if (data?.orders.length === 0) {
              setFinished(true)
            }
            setRows(rows.concat(data?.orders.map(renderRow)))
          }
        }}
      />
    </Page>
  )
}
