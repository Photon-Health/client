import { useState, useEffect, useContext } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react'
import { FiCheck, FiMapPin } from 'react-icons/fi'
import { Helmet } from 'react-helmet'
import moment from 'moment'

import { formatAddress } from '../utils/general'

import { graphQLClient } from '../configs/graphqlClient'
import { GET_PHARMACIES } from '../utils/queries'
import { SELECT_ORDER_PHARMACY } from '../utils/mutations'
import { FixedFooter } from '../components/FixedFooter'
import { Nav } from '../components/Nav'
import { PoweredBy } from '../components/PoweredBy'
import { LocationModal } from '../components/LocationModal'
import { PharmacyList } from '../components/PharmacyList'
import { OrderContext } from './Main'
import t from '../utils/text.json'

const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER']
export const UNOPEN_BUSINESS_STATUS_MAP = {
  CLOSED_TEMPORARILY: 'Closed Temporarily',
  CLOSED_PERMANENTLY: 'Closed Permanently'
}

const placesService = new google.maps.places.PlacesService(document.createElement('div'))

const query = (method, data) =>
  new Promise((resolve, reject) => {
    placesService[method](data, (response, status) => {
      if (status === 'OK') {
        resolve({ response, status })
      } else {
        reject({ response, status })
      }
    })
  })

function getHours(hoursData) {
  const now = moment()
  const today = now.isoWeekday()
  let nextOpenTime = null
  let nextCloseTime = null
  let is24Hr = false

  if (hoursData?.length === 1) is24Hr = true

  if (hoursData && !is24Hr) {
    for (let i = 0; i < hoursData.length; i++) {
      const period = hoursData[i]
      const open = moment(period.open.time, 'HHmm')
      const close = moment(period.close.time, 'HHmm')

      if (period.open.day === today) {
        if (now.isBetween(open, close)) {
          nextCloseTime = moment(period.close.time, 'HHmm').format('HHmm')
          nextOpenTime = moment(hoursData[i + 1].open.time, 'HHmm').format('HHmm')
          break
        } else if (now.isBefore(open)) {
          nextOpenTime = open.format('HHmm')
          nextCloseTime = close.format('HHmm')
          break
        }
      } else if (period.open.day > today) {
        nextOpenTime = open.format('HHmm')
        nextCloseTime = close.format('HHmm')
        break
      }
    }
  }

  return {
    is24Hr,
    opens: nextOpenTime,
    closes: nextCloseTime
  }
}

export const Pharmacy = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const order = useContext(OrderContext)

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [pharmacyOptions, setPharmacyOptions] = useState([])

  const [showFooter, setShowFooter] = useState<boolean>(false)

  const [selectedId, setSelectedId] = useState<string>('')
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false)

  const [error, setError] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false)

  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [showingAllPharmacies, setShowingAllPharmacies] = useState<boolean>(false)

  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [location, setLocation] = useState<string>('')

  const toast = useToast()

  const reset = () => {
    setPharmacyOptions([])
    setSelectedId('')
    setShowFooter(false)
    setShowingAllPharmacies(false)
  }

  const handleModalClose = ({
    loc = undefined,
    lat = undefined,
    lng = undefined
  }: {
    loc: string | undefined
    lat: number | undefined
    lng: number | undefined
  }) => {
    if (loc && loc !== location) {
      reset()
    }
    if (lat && lng && loc) {
      setLocation(loc)
      setLatitude(lat)
      setLongitude(lng)
    }
    setLocationModalOpen(false)
  }

  const fetchPharmacies = async () => {
    setLoadingMore(true)

    graphQLClient.setHeader('x-photon-auth', token)

    const location = {
      latitude,
      longitude,
      radius: 25
    }
    const limit = 3
    const offset = pharmacyOptions.length

    let results: any
    try {
      results = await graphQLClient.request(GET_PHARMACIES, { location, limit, offset })
    } catch (error) {
      console.error(JSON.stringify(error, undefined, 2))
      console.log(error)

      if (error?.response.errors[0].message === 'No pharmacies found near location') {
        setShowingAllPharmacies(true)
      }
    }

    if (results?.pharmaciesByLocation.length > 0) {
      for (let i = 0; i < results.pharmaciesByLocation.length; i++) {
        const name = results.pharmaciesByLocation[i].name
        const address = results.pharmaciesByLocation[i].address
          ? formatAddress(results.pharmaciesByLocation[i].address)
          : ''

        const placeRequest = {
          query: name + ' ' + address,
          fields: ['place_id']
        }
        const { response: place, status: placeStatus }: any = await query(
          'findPlaceFromQuery',
          placeRequest
        )

        if (placeStatus === 'OK' && place[0].place_id) {
          const detailsRequest = {
            placeId: place[0].place_id,
            fields: ['opening_hours', 'utc_offset_minutes', 'rating', 'business_status']
          }
          const { response: details, status: detailsStatus }: any = await query(
            'getDetails',
            detailsRequest
          )

          if (detailsStatus === 'OK') {
            results.pharmaciesByLocation[i].businessStatus = details?.business_status || ''
            results.pharmaciesByLocation[i].rating = details?.rating || undefined

            const openForBusiness = details?.business_status === 'OPERATIONAL'
            if (openForBusiness) {
              const { is24Hr, opens, closes } = getHours(details?.opening_hours?.periods)
              results.pharmaciesByLocation[i].hours = {
                open: details?.opening_hours?.isOpen() || false,
                is24Hr,
                opens,
                closes
              }
            }
          }
        }
        setPharmacyOptions([...pharmacyOptions, ...results.pharmaciesByLocation])
      }
    }

    setLoadingMore(false)
  }

  const handleShowMore = () => {
    fetchPharmacies()
  }

  const handleSelect = (pharmacyId: string) => {
    setSelectedId(pharmacyId)
    setShowFooter(true)
  }

  const handleSubmit = async () => {
    if (!selectedId) {
      console.error('No selectedId. Cannot set pharmacy on order.')
      return
    }

    try {
      setSubmitting(true)

      graphQLClient.setHeader('x-photon-auth', token)
      const results: any = await graphQLClient.request(SELECT_ORDER_PHARMACY, {
        orderId: order.id,
        pharmacyId: selectedId,
        patientId: order.patient.id
      })

      setTimeout(() => {
        if (!!results?.selectOrderPharmacy) {
          setSuccessfullySubmitted(true)
          setTimeout(() => {
            setShowFooter(false)
            navigate(`/status?orderId=${order.id}&token=${token}`)
          }, 1000)
        } else {
          toast({
            title: 'Unable to submit pharmacy selection',
            description: 'Please refresh and try again',
            position: 'top',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
        setSubmitting(false)
      }, 1000)
    } catch (error) {
      setSubmitting(false)

      console.log(error)
      console.error(JSON.stringify(error, undefined, 2))

      if (error?.response?.errors) {
        if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
          navigate('/no-match')
        } else {
          setError(error.response.errors[0].message)
        }
      }
    }
  }

  useEffect(() => {
    if (latitude && longitude) {
      fetchPharmacies()
    }
  }, [latitude, longitude])

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  const { organization } = order

  return (
    <Box>
      <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />
      <Helmet>
        <title>{t.pharmacy.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={6} align="span" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.pharmacy.heading}
            </Heading>
            <Text>{t.pharmacy.subheading}</Text>
          </VStack>
          <HStack justify="space-between" w="full">
            {location ? (
              <VStack w="full" align="start" spacing={1}>
                <Text size="sm">{t.pharmacy.showing}</Text>
                <Link
                  onClick={() => setLocationModalOpen(true)}
                  display="inline"
                  color="brandLink"
                  fontWeight="medium"
                >
                  <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                  {location}
                </Link>
              </VStack>
            ) : (
              <Button variant="brand" onClick={() => setLocationModalOpen(true)}>
                {t.pharmacy.setLocation}
              </Button>
            )}
            {!isMobile && pharmacyOptions.length > 0 ? (
              <Text size="sm" color="gray.500" whiteSpace="nowrap" alignSelf="flex-end">
                {t.pharmacy.sorted}
              </Text>
            ) : null}
          </HStack>

          <PharmacyList
            pharmacies={pharmacyOptions}
            selectedId={selectedId}
            handleSelect={handleSelect}
            handleShowMore={handleShowMore}
            loadingMore={loadingMore}
            showingAllPharmacies={showingAllPharmacies}
          />
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            w="full"
            variant="brand"
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleSubmit : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.pharmacy.thankYou : t.pharmacy.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  )
}
