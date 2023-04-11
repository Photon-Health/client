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
  useToast
} from '@chakra-ui/react'
import { FiCheck, FiMapPin } from 'react-icons/fi'

import { Helmet } from 'react-helmet'
import dayjs from 'dayjs'

import { formatAddress, getHours } from '../utils/general'
import { GET_PHARMACIES } from '../utils/queries'
import t from '../utils/text.json'
import { SELECT_ORDER_PHARMACY } from '../utils/mutations'
import { graphQLClient } from '../configs/graphqlClient'
import { FixedFooter } from '../components/FixedFooter'
import { Nav } from '../components/Nav'
import { PoweredBy } from '../components/PoweredBy'
import { LocationModal } from '../components/LocationModal'
import { PickupOptions } from '../components/PickupOptions'
import { CourierOptions } from '../components/CourierOptions'
import { OrderContext } from './Main'

const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER']
export const UNOPEN_BUSINESS_STATUS_MAP = {
  CLOSED_TEMPORARILY: 'Closed Temporarily',
  CLOSED_PERMANENTLY: 'Closed Permanently'
}

const placesService = new google.maps.places.PlacesService(document.createElement('div'))
const geocoder = new google.maps.Geocoder()

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

export const Pharmacy = () => {
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

  const [location, setLocation] = useState<string>(
    order?.address ? formatAddress(order.address) : ''
  )
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)

  const [enableCourier, setEnableCourier] = useState<boolean>(false)

  const toast = useToast()

  const reset = () => {
    setPharmacyOptions([])
    setSelectedId('')
    setShowFooter(false)
    setShowingAllPharmacies(false)
    setEnableCourier(false)
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
    // Reset view if search location changes
    if (loc && loc !== location) {
      if (lat && lng) {
        reset()
        setLocation(loc)
        setLatitude(lat)
        setLongitude(lng)
      }
    }

    setLocationModalOpen(false)
  }

  const geocode = async (address: string) => {
    const data = await geocoder.geocode({ address })
    if (data?.results) {
      return {
        loc: data.results[0].formatted_address,
        lat: data.results[0].geometry.location.lat(),
        lng: data.results[0].geometry.location.lng()
      }
    }
  }

  const fetchPharmacies = async () => {
    setLoadingMore(true)

    // Courier option limited to MoPed in Austin, TX
    const searchingInAustinTX = /Austin.*(?:TX|Texas)/.test(location)
    const patientAddressInAustinTX =
      order?.address?.city === 'Austin' && order?.address?.state === 'TX'
    const isMoPed = order?.organization?.id === process.env.REACT_APP_MODERN_PEDIATRICS_ORG_ID
    if (true) {
      setEnableCourier(true)
    }

    // On initializing, we won't have lat/lng
    let loc: string = location
    let lat: number = latitude
    let lng: number = longitude
    if (!lat || !lng) {
      const geo = await geocode(location)
      if (!geo) return

      loc = geo.loc
      lat = geo.lat
      lng = geo.lng

      // Save location data for show more pharmacies
      setLocation(loc)
      setLatitude(lat)
      setLongitude(lng)
    }

    // Get pharmacies from our internal list
    const locationData = {
      latitude: lat,
      longitude: lng,
      radius: 25
    }
    const limit = 3
    const offset = pharmacyOptions.length

    graphQLClient.setHeader('x-photon-auth', token)

    let pharmaciesResults: any
    try {
      pharmaciesResults = await graphQLClient.request(GET_PHARMACIES, {
        location: locationData,
        limit,
        offset
      })
    } catch (error) {
      console.error(JSON.stringify(error, undefined, 2))
      console.log(error)

      if (error?.response.errors[0].message === 'No pharmacies found near location') {
        setShowingAllPharmacies(true)
      }
    }

    if (pharmaciesResults?.pharmaciesByLocation.length > 0) {
      for (let i = 0; i < pharmaciesResults.pharmaciesByLocation.length; i++) {
        // Search for google place
        const name = pharmaciesResults.pharmaciesByLocation[i].name
        const address = pharmaciesResults.pharmaciesByLocation[i].address
          ? formatAddress(pharmaciesResults.pharmaciesByLocation[i].address)
          : ''
        const placeRequest = {
          query: name + ' ' + address,
          fields: ['place_id']
        }

        let placeId, placeStatus
        try {
          const { response, status }: any = await query('findPlaceFromQuery', placeRequest)
          placeId = response[0]?.place_id
          placeStatus = status
        } catch (error) {
          console.error(JSON.stringify(error, undefined, 2))
          console.log(error)

          continue
        }

        // Search for google place details
        if (placeStatus === 'OK' && placeId) {
          const detailsRequest = {
            placeId,
            // 'getDetails' requires utc_offset_minutes to provide isOpen()
            fields: ['opening_hours', 'utc_offset_minutes', 'rating', 'business_status']
          }
          const { response: details, status: detailsStatus }: any = await query(
            'getDetails',
            detailsRequest
          )

          if (detailsStatus === 'OK') {
            pharmaciesResults.pharmaciesByLocation[i].businessStatus =
              details?.business_status || ''
            pharmaciesResults.pharmaciesByLocation[i].rating = details?.rating || undefined

            const openForBusiness = details?.business_status === 'OPERATIONAL'
            if (openForBusiness) {
              const currentTime = dayjs().format('HHmm')
              const { is24Hr, opens, opensDay, closes } = getHours(
                details?.opening_hours?.periods,
                currentTime
              )
              pharmaciesResults.pharmaciesByLocation[i].hours = {
                open: details?.opening_hours?.isOpen() || false,
                is24Hr,
                opens,
                opensDay,
                closes
              }
            }
          }
        }
      }
      setPharmacyOptions([...pharmacyOptions, ...pharmaciesResults.pharmaciesByLocation])
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
            const selectedCourier = selectedId === process.env.REACT_APP_CAPSULE_PHARMACY_ID
            navigate(
              `/status?orderId=${order.id}&token=${token}${selectedCourier ? '&courier=true' : ''}`
            )
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
    if (location) {
      fetchPharmacies()
    }
  }, [location])

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  const { organization, address } = order

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
                  size="sm"
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
          </HStack>

          {location ? (
            <VStack spacing={9} align="stretch">
              {enableCourier ? (
                <CourierOptions
                  capsule
                  location={location}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  patientAddress={formatAddress(address)}
                />
              ) : null}

              <PickupOptions
                pharmacies={pharmacyOptions}
                selectedId={selectedId}
                handleSelect={handleSelect}
                handleShowMore={handleShowMore}
                loadingMore={loadingMore}
                showingAllPharmacies={showingAllPharmacies}
                courierEnabled={enableCourier}
              />
            </VStack>
          ) : null}
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
